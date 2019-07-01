import * as _ from 'underscore'
import * as objectPath from 'object-path'
import {
	SegmentContext, IngestSegment, BlueprintResultSegment, IBlueprintSegment, BlueprintResultPart, IngestPart, IBlueprintPart, IBlueprintPiece, IBlueprintAdLibPiece
} from 'tv-automation-sofie-blueprints-integration'
import { literal, isAdLibPiece } from '../common/util'
import { SourceLayer } from '../types/layers'
import { Piece, SegmentConf, PieceParams, ObjectType } from '../types/classes'
import { AtemTransitionStyle } from 'timeline-state-resolver-types'
import { parseConfig } from './helpers/config'
import { parseSources, Attributes, GetInputValueFromPiece } from './helpers/sources'
import { CreatePieceVideo, CreatePieceCam, CreatePieceGraphic, CreatePieceGraphicOverlay, CreatePieceInTransition, CreatePieceScript, CreatePieceOutTransition, CreatePieceVoiceover, CreatePieceBreaker, CreatePieceRemote } from './helpers/pieces'
import { CreateDVE } from './helpers/dve'

export function getSegment (context: SegmentContext, ingestSegment: IngestSegment): BlueprintResultSegment {
	const config: SegmentConf = {
		context: context,
		config: parseConfig(context),
		sourceConfig: parseSources(context, parseConfig(context)),
		frameHeight: 1920,
		frameWidth: 1080,
		framesPerSecond: 50
	}
	console.log(config.sourceConfig)
	const segment = literal<IBlueprintSegment>({
		name: ingestSegment.name,
		metaData: {}
	})
	const parts: BlueprintResultPart[] = []

	if (ingestSegment.payload['float']) {
		return {
			segment,
			parts
		}
	}

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
							if (isAdLibPiece(p)) {
								adLibPieces.push(p as IBlueprintAdLibPiece)
							} else {
								pieces.push(p as IBlueprintPiece)
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
								transitionType = transitionTypeFromString(pieceList[i].attributes[Attributes.TRANSITION])
							}
						}

						// Iterate over pieces + generate.
						for (let i = 0; i < pieceList.length; i++) {
							let params: PieceParams = {
								config: config,
								piece: pieceList[i],
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
									if (params.piece.attributes[Attributes.TRANSITION]) {
										pieces.push(CreatePieceInTransition(params.piece, transitionType, params.piece.duration || 1000, GetInputValueFromPiece(params.config, params.piece)))
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

/**
 * Returns the AtemTransitionStyle represented by a string.
 * If no match is found, CUT is returned.
 * @param {string} str Transtion style to match.
 */
function transitionTypeFromString (str: string): AtemTransitionStyle {
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
	} else {
		return AtemTransitionStyle.CUT
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
	let p = creator(params, transitionType || AtemTransitionStyle.CUT)
	if (p.content) {
		if (isAdLibPiece(p)) {
			adLibPieces.push(p as IBlueprintAdLibPiece)
		} else {
			pieces.push(p as IBlueprintPiece)

			if (params.context.match(/titles/i) && params.piece.objectType.match(/(graphic)|(video)/i)) {
				let input = params.config.config.studio.AtemSource.Server1
				pieces.push(CreatePieceOutTransition(params.piece, transitionType || AtemTransitionStyle.DIP, (1 / params.config.framesPerSecond) * 150 * 1000, input)) // TODO: Use actual framerate
			}

			if (params.context.match(/breaker/i) && params.piece.objectType.match(/(graphic)|(video)/i)) {
				let input = params.config.config.studio.AtemSource.Server1
				pieces.push(CreatePieceOutTransition(params.piece, transitionType || AtemTransitionStyle.DIP, (1 / params.config.framesPerSecond) * 50 * 1000, input)) // TODO: Use actual framerate
			}

			if (params.context.match(/package/i) && params.piece.objectType.match(/video/i)) {
				let input = params.config.config.studio.AtemSource.Server1
				pieces.push(CreatePieceInTransition(params.piece, transitionType || AtemTransitionStyle.MIX, (1 / params.config.framesPerSecond) * 150 * 1000, input))
				pieces.push(CreatePieceOutTransition(params.piece, transitionType || AtemTransitionStyle.DIP, (1 / params.config.framesPerSecond) * 50 * 1000, input)) // TODO: Use actual framerate
			}
		}
	}
}

/**
 * Creates a generic part. Only used as a placeholder for part types that have not been implemented yet.
 * @param {Piece} piece Piece to evaluate.
 */
function createGeneric (ingestPart: IngestPart): BlueprintResultPart {
	const part = literal<IBlueprintPart>({
		externalId: ingestPart.externalId,
		title: ingestPart.name || 'Unknown',
		metaData: {},
		typeVariant: '',
		expectedDuration: 5000
	})

	const piece = literal<IBlueprintPiece>({
		_id: '',
		externalId: ingestPart.externalId,
		name: part.title,
		enable: { start: 0, duration: 100 },
		outputLayerId: 'pgm0',
		sourceLayerId: SourceLayer.PgmCam
	})

	return {
		part,
		adLibPieces: [],
		pieces: [piece]
	}
}

/**
 * Creates a part from an ingest part and associated pieces.
 * @param {IngestPart} ingestPart Ingest part.
 * @param {IBlueprintPiece[]} pieces Array of pieces.
 */
function createPart (ingestPart: IngestPart, pieces: IBlueprintPiece[], adLibPieces: IBlueprintAdLibPiece[]): BlueprintResultPart {
	const part = literal<IBlueprintPart>({
		externalId: ingestPart.externalId,
		title: ingestPart.name || 'Unknown',
		metaData: {},
		typeVariant: '',
		expectedDuration: calculateExpectedDuration(pieces)
	})

	return {
		part,
		adLibPieces: adLibPieces,
		pieces: pieces
	}
}

/**
 * Calculates the expected duration of a part from component pieces.
 * @param {IBlueprintPiece[]} pieces Pieces to calculate duration for.
 */
function calculateExpectedDuration (pieces: IBlueprintPiece[]): number {
	if (pieces.length) {
		let start = 0
		let end = 0

		pieces.forEach(piece => {
			if (!piece.isTransition) {
				let st = piece.enable.start as number
				let en = piece.enable.start as number
				if (piece.enable.duration) {
					en = (piece.enable.start as number) + (piece.enable.duration as number)
				} else if (piece.enable.end) {
					en = (piece.enable.end as number)
				}

				if (piece.infiniteMode) {
					en = en + 1000
				}

				if (st < start) {
					start = st
				}

				if (en > end) {
					end = en
				}

				if (st > end) {
					end = st
				}
			}
		})

		return end - start
	}
	return 0
}
