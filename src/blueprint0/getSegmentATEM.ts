import * as _ from 'underscore'
import * as objectPath from 'object-path'
import { SegmentContext, IngestSegment, IBlueprintSegment, BlueprintResultPart, BlueprintResultSegment, IBlueprintPiece, IBlueprintAdLibPiece } from 'tv-automation-sofie-blueprints-integration'
import { SegmentConf, Piece, PieceParams, ObjectType } from '../types/classes'
import { createGeneric, createPart } from './helpers/parts'
import { CreateDVE } from './helpers/atem/dve'
import { isAdLibPiece } from '../common/util'
import { CreatePieceBreaker, CreatePieceOutTransition, CreatePieceInTransition, CreatePieceVideo, CreatePieceCam, CreatePieceGraphic, CreatePieceGraphicOverlay, CreatePieceVoiceover, CreatePieceRemote } from './helpers/atem/pieces'
import { CreatePieceScript } from './helpers/pieces'
import { AtemTransitionStyle } from 'timeline-state-resolver-types'
import { Attributes, GetInputValueFromPiece } from './helpers/sources'

export function getSegmentATEM (context: SegmentContext, ingestSegment: IngestSegment, config: SegmentConf, segment: IBlueprintSegment, parts: BlueprintResultPart[]): BlueprintResultSegment {
	let currentPartIndex = 0
	for (const part of ingestSegment.parts) {
		if (!part.payload) {
			context.warning(`Missing payload for part: '${part.name || part.externalId}'`)
		} else if (part.payload['float']) {
			continue
		} else {
			const type = objectPath.get(part.payload, 'type', '') + ''
			if (!type) {
				context.warning(`Missing type for part: '${part.name || part.externalId}'`)
				parts.push(createGeneric(part))
			} else {
				let pieces: IBlueprintPiece[] = []
				let adLibPieces: IBlueprintAdLibPiece[] = []
				if ('pieces' in part.payload) {
					let pieceList = part.payload['pieces'] as Piece[]

					// Generate script
					let script = ''
					if ('script' in part.payload) {
						script += part.payload['script']
					}
					pieceList.forEach(piece => {
						if (piece.script) {
							script += `\n${piece.script}`
						}
					})

					if (type.match(/dve/i)) {
						let length = 0

						for (let i = 0; i < pieceList.length; i++) {
							if (!pieceList[i].objectType.match(/(transition)|(split)/i)) {
								length++
							}
						}

						if (length > 5) {
							// TODO: Report this to spreadsheet
							context.warning('Maximum number of elements in DVE is 4')
						} else if (length < 2) {
							context.warning('Minimum number of elements in DVE is 2')
						} else {
							let sources = Math.min(length, 4)
							let p = CreateDVE(config, pieceList, sources, config.frameHeight, config.frameWidth)
							if (p) {
								if (isAdLibPiece(p)) {
									adLibPieces.push(p as IBlueprintAdLibPiece)
								} else {
									pieces.push(p as IBlueprintPiece)
								}
							}
						}
					} else if (type.match(/breaker/i)) {
						// Validate breaker.
						// Don't allow any other pieces to be specified, and don't allow transition type to be changed (for now).
						if (pieceList.length > 1) {
							for (let i = 1; i < pieceList.length; i++) {
								if (pieceList[i].objectType.match(/transition/i)) {
									context.warning(`Cannot change transition type of Breaker. Wipe transition will be used.`)
								} else {
									context.warning(`Only 1 item allowed in Breaker. Move ${pieceList[i].clipName || pieceList[i].id} to new item.`)
								}
							}
						}

						pieces.push(CreatePieceBreaker(pieceList[0], pieceList[0].duration || 1000))
					} else {
						let transitionType = AtemTransitionStyle.CUT

						if (type.match(/head/)) {
							if (parts[currentPartIndex - 1] && (objectPath.get(parts[currentPartIndex - 1], 'type', '') + '').match(/head/)) {
								// Rest of clips in head wipes in/out.
								transitionType = AtemTransitionStyle.WIPE
							} else {
								// First clip in head cuts.
								transitionType = AtemTransitionStyle.CUT
							}
						}

						for (let i = 0; i < pieceList.length; i++) {
							if (pieceList[i].objectType.match(/transition/i)) {
								let pieceTransition = pieceList[i].transition
								if (pieceTransition) transitionType = transitionTypeFromString(pieceTransition, AtemTransitionStyle.CUT)
							}
						}

						// Iterate over pieces + generate.
						for (let i = 0; i < pieceList.length; i++) {
							let params: PieceParams = {
								config: config,
								piece: ConvertFile(pieceList[i]),
								context: type
							}

							switch (params.piece.objectType) {
								case ObjectType.VIDEO:
									if (params.piece.clipName) {
										createPieceByType(params, CreatePieceVideo, pieces, adLibPieces, transitionType)
									} else {
										context.warning(`Missing clip for video: ${params.piece.id}`)
									}
									break
								case ObjectType.CAMERA:
									if (params.piece.attributes[Attributes.CAMERA]) {
										createPieceByType(params, CreatePieceCam, pieces, adLibPieces, transitionType)
									} else {
										context.warning(`Missing camera for camera: ${params.piece.id}`)
									}
									break
								case ObjectType.GRAPHIC:
									if (params.piece.clipName) {
										createPieceByType(params, CreatePieceGraphic, pieces, adLibPieces, transitionType)
									} else {
										context.warning(`Missing clip for graphic: ${params.piece.id}`)
									}
									break
								case ObjectType.OVERLAY:
									if (params.piece.clipName) {
										createPieceByType(params, CreatePieceGraphicOverlay, pieces, adLibPieces, transitionType)
									} else {
										context.warning(`Missing clip for overlay: ${params.piece.id}`)
									}
									break
								case ObjectType.TRANSITION:
									if (params.piece.transition) {
										pieces.push(CreatePieceInTransition(params.piece, transitionType, params.piece.duration || 1000, GetInputValueFromPiece(params.config, params.piece)))
										pieces.push(CreatePieceInTransition(params.piece, transitionType, params.piece.duration || 1000, GetInputValueFromPiece(params.config, pieceList[i - 1])))
									} else {
										context.warning(`Missing transition for transition: ${params.piece.id}`)
									}
									break
								case ObjectType.VOICEOVER:
									if (params.piece.script) {
										createPieceByType(params, CreatePieceVoiceover, pieces, adLibPieces, transitionType)
									} else {
										context.warning(`Missing script for voiceover: ${params.piece.id}`)
									}
									break
								case ObjectType.REMOTE:
									if (params.piece.attributes[Attributes.REMOTE]) {
										createPieceByType(params, CreatePieceRemote, pieces, adLibPieces, transitionType)
									} else {
										context.warning(`Missing remote source for remote: ${params.piece.id}`)
									}
									break
								case ObjectType.SCRIPT:
									break
								default:
									context.warning(`Missing objectType '${params.piece.objectType}' for piece: '${params.piece.clipName || params.piece.id}'`)
									break
							}

							if (i === 0 && script) {
								params.piece.script = script
								pieces.push(CreatePieceScript(params))
							}
						}
					}
				}
				parts.push(createPart(part, pieces, adLibPieces))
			}
		}
		currentPartIndex++
	}

	return {
		segment,
		parts
	}
}

function ConvertFile (piece: Piece): Piece {
	if (piece.clipName.match(/.*\..*/i)) {
		piece.clipName = piece.clipName.replace(/\..*/g, '')
	}
	return piece
}

/**
 * Returns the AtemTransitionStyle represented by a string.
 * If no match is found, CUT is returned.
 * @param {string} str Transtion style to match.
 */
function transitionTypeFromString (str: string, defaultTransition: AtemTransitionStyle): AtemTransitionStyle {
	if (str.match(/mix/i)) {
		return AtemTransitionStyle.MIX
	} else if (str.match(/dip/i)) {
		return AtemTransitionStyle.DIP
	} else if (str.match(/wipe/i)) {
		return AtemTransitionStyle.WIPE
	} else if (str.match(/dve/i)) {
		return AtemTransitionStyle.DVE
	} else if (str.match(/sting/i)) {
		return AtemTransitionStyle.STING
	} else if (str.match(/cut/i)) {
		return AtemTransitionStyle.CUT
	} else {
		return defaultTransition
	}
}

/**
 * Creates a piece using a given function.
 * @param {Piece} piece Piece to create.
 * @param {(config: SegmentConf, p: Piece, context: string, transition: AtemTransitionStyle) => IBlueprintPiece | IBlueprintAdLibPiece} creator Function for creating the piece.
 * @param {IBlueprintPiece[]} pieces Array of IBlueprintPiece to add regular pieces to.
 * @param {IBlueprintAdLibPiece[]} adLibPieces Array of IBlueprintAdLibPiece to add adLib pieces to.
 * @param {string} context The part type the piece belogs to e.g. 'HEAD'
 * @param {AtemTransitionsStyle} transitionType Type of transition to use.
 */
function createPieceByType (
		params: PieceParams,
		creator: (params: PieceParams, transition: AtemTransitionStyle) => IBlueprintPiece | IBlueprintAdLibPiece,
		pieces: IBlueprintPiece[],
		adLibPieces: IBlueprintAdLibPiece[],
		transitionType?: AtemTransitionStyle
	) {
	let transition = transitionType
	if (params.piece.attributes['transition']) transition = transitionTypeFromString(params.piece.attributes['transition'], transitionType || AtemTransitionStyle.CUT)

	let p = creator(params, transition || AtemTransitionStyle.CUT)
	if (p.content) {
		if (isAdLibPiece(p)) {
			adLibPieces.push(p as IBlueprintAdLibPiece)
		} else {
			pieces.push(p as IBlueprintPiece)

			if (params.context.match(/titles/i) && params.piece.objectType.match(/(graphic)|(video)/i)) {
				let input = params.config.config.studio.AtemSource.Server1
				pieces.push(CreatePieceOutTransition(params.piece, transition || AtemTransitionStyle.DIP, (1 / params.config.framesPerSecond) * 150 * 1000, input)) // TODO: Use actual framerate
			}

			if (params.context.match(/breaker/i) && params.piece.objectType.match(/(graphic)|(video)/i)) {
				let input = params.config.config.studio.AtemSource.Server1
				pieces.push(CreatePieceOutTransition(params.piece, transition || AtemTransitionStyle.DIP, (1 / params.config.framesPerSecond) * 50 * 1000, input)) // TODO: Use actual framerate
			}

			if (params.context.match(/package/i) && params.piece.objectType.match(/video/i)) {
				let input = params.config.config.studio.AtemSource.Server1
				pieces.push(CreatePieceInTransition(params.piece, transition || AtemTransitionStyle.MIX, (1 / params.config.framesPerSecond) * 150 * 1000, input))
				pieces.push(CreatePieceOutTransition(params.piece, transition || AtemTransitionStyle.DIP, (1 / params.config.framesPerSecond) * 50 * 1000, input)) // TODO: Use actual framerate
			}
		}
	}
}
