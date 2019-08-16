import * as _ from 'underscore'
import * as objectPath from 'object-path'
import { SegmentConf, Piece, PieceParams, ObjectType } from '../types/classes'
import { IngestSegment, IBlueprintSegment, BlueprintResultPart, IBlueprintPiece, IBlueprintAdLibPiece, SegmentContext, BlueprintResultSegment, VTContent, CameraContent, GraphicsContent } from 'tv-automation-sofie-blueprints-integration'
import { VMixTransitionType, TSRTimelineObj, TimelineObjVMixPlayClip, DeviceType, TimelineContentTypeVMix, TimelineObjVMixClipToProgram, VMixTransition, TimelineObjVMixCameraActive, TimelineObjVMixOverlayInputByNameIn, TimelineObjVMixOverlayInputOFF } from 'timeline-state-resolver-types'
import { literal, isAdLibPiece } from '../common/util'
import { SourceLayer, VMixLLayer } from '../types/layers'
import { createGeneric, createPart } from './getSegment'
import { CreatePieceGeneric, CreatePieceScript } from './helpers/pieces'
import { CreateContentVT, CreateContentCam, CreateContentGraphics } from './helpers/content'
import { TimelineEnable } from 'timeline-state-resolver-types/dist/superfly-timeline'
import { CreateEnableForTimelineObject } from './helpers/timeline'
import { Attributes } from './helpers/sources'

export function getSegmentVMix (context: SegmentContext, ingestSegment: IngestSegment, config: SegmentConf, segment: IBlueprintSegment, parts: BlueprintResultPart[]): BlueprintResultSegment {
	if (!config.config.studio.VMixMediaDirectory) {
		context.warning(`The blueprint setting 'VMix Media Directory' must be set for VMix workflows`)
		return {
			segment,
			parts
		}
	}

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
						continue
					} else if (type.match(/breaker/i)) {
						continue
					} else {
						let transitionType = VMixTransitionType.Cut

						for (let i = 0; i < pieceList.length; i++) {
							if (pieceList[i].objectType.match(/transition/i)) {
								let pieceTransition = pieceList[i].transition
								if (pieceTransition) transitionType = transitionFromString(pieceTransition, VMixTransitionType.Cut)
							}
						}

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
	}

	return {
		segment,
		parts
	}
}

/**
 * Creates a cam piece.
 * @param {PieceParams} params Piece to create.
 */
export function CreatePieceVideo (params: PieceParams, transition: VMixTransitionType): IBlueprintAdLibPiece | IBlueprintPiece {
	let p = CreatePieceGeneric(params.piece)

	p.sourceLayerId = SourceLayer.PgmClip

	let content: VTContent = CreateContentVT(params.piece)

	switch (params.context) {
		default:
			content.timelineObjects = _.compact<TSRTimelineObj>([
				CreatePlayClipTimelineObject(CreateEnableForTimelineObject(params.piece), VMixLLayer.VMixProgram, params.piece.clipName, params.config.config.studio.VMixMediaDirectory)
			])
			break
	}

	// TODO: Place on screen
	/*if (!checkAndPlaceOnScreen(p, params.piece.attributes)) {
	}*/

	content.timelineObjects.push(
		CreateSwitchToClipTimelineObject(
			CreateEnableForTimelineObject(params.piece, 1),
			VMixLLayer.VMixProgram,
			params.piece.clipName,
			{
				number: 4,
				effect: transition,
				duration: 1000
			}
		)
	)

	p.content = content

	return p
}

/**
 * Creates a cam piece.
 * @param {PieceParams} params Piece to create.
 */
export function CreatePieceGraphic (params: PieceParams, transition: VMixTransitionType): IBlueprintAdLibPiece | IBlueprintPiece {
	let p = CreatePieceGeneric(params.piece)

	p.sourceLayerId = SourceLayer.PgmGraphicsSuper

	let content: GraphicsContent = CreateContentGraphics(params.piece)

	switch (params.context) {
		default:
			content.timelineObjects = _.compact<TSRTimelineObj>([
				CreatePlayClipTimelineObject(CreateEnableForTimelineObject(params.piece), VMixLLayer.VMixProgram, params.piece.clipName, params.config.config.studio.VMixMediaDirectory)
			])
			break
	}

	content.timelineObjects.push(
		CreateSwitchToClipTimelineObject(
			CreateEnableForTimelineObject(params.piece, 1),
			VMixLLayer.VMixProgram,
			params.piece.clipName,
			{
				number: 4,
				effect: transition,
				duration: 1000
			}
		)
	)

	p.content = content

	return p
}

/**
 * Creates a cam piece.
 * @param {PieceParams} params Piece to create.
 */
export function CreatePieceCam (params: PieceParams, transition: VMixTransitionType): IBlueprintAdLibPiece | IBlueprintPiece {
	let p = CreatePieceGeneric(params.piece)

	p.sourceLayerId = SourceLayer.PgmCam
	p.name = params.piece.attributes[Attributes.CAMERA]
	let content: CameraContent = CreateContentCam(params.config, params.piece)

	content.timelineObjects = _.compact<TSRTimelineObj>([
		literal<TimelineObjVMixCameraActive>({
			id: '',
			enable: CreateEnableForTimelineObject(params.piece),
			priority: 1,
			layer: VMixLLayer.VMixProgram,
			content: {
				deviceType: DeviceType.VMIX,
				type: TimelineContentTypeVMix.CAMERA_ACTIVE,
				camera: params.piece.attributes[Attributes.CAMERA],
				transition: {
					effect: transition,
					duration: 1000,
					number: 4
				}
			}
		})
	])

	p.content = content

	return p
}

function CreatePlayClipTimelineObject (enable: TimelineEnable, layer: VMixLLayer, file: string, mediaDirectory: string): TimelineObjVMixPlayClip {
	return literal<TimelineObjVMixPlayClip>({
		id: '',
		enable: enable,
		priority: 1,
		layer: layer,
		content: {
			deviceType: DeviceType.VMIX,
			type: TimelineContentTypeVMix.PLAY_CLIP,
			mediaDirectory: mediaDirectory,
			clipName: file
		}
	})
}

function CreateSwitchToClipTimelineObject (enable: TimelineEnable, layer: VMixLLayer, file: string, transition?: VMixTransition) {
	return literal<TimelineObjVMixClipToProgram>({
		id: '',
		enable: enable,
		priority: 1,
		layer: layer,
		content: {
			deviceType: DeviceType.VMIX,
			type: TimelineContentTypeVMix.CLIP_TO_PROGRAM,
			clipName: file,
			transition: transition
		}
	})
}

function CreateOverlayTimelineObject (enable: TimelineEnable, layer: VMixLLayer, file: string, mediaDirectory: string) {
	return literal<TimelineObjVMixOverlayInputByNameIn>({
		id: 'overlayIn1',
		enable: enable,
		priority: 1,
		layer: layer,
		content: {
			deviceType: DeviceType.VMIX,
			type: TimelineContentTypeVMix.OVERLAY_INPUT_BY_NAME_IN,
			inputName: file,
			mediaDirectory: mediaDirectory,
			overlay: 4
		}
	})
}

/**
 * Creates a graphics overlay.
 * @param {PieceParams} params Piece to create.
 */
export function CreatePieceGraphicOverlay (params: PieceParams): IBlueprintAdLibPiece | IBlueprintPiece {
	let p = CreatePieceGeneric(params.piece)

	p.sourceLayerId = SourceLayer.PgmGraphicsSuper

	let content: GraphicsContent = CreateContentGraphics(params.piece)

	content.timelineObjects = _.compact<TSRTimelineObj>([
		CreateOverlayTimelineObject(CreateEnableForTimelineObject(params.piece, -1), VMixLLayer.VMixProgram, params.piece.clipName, params.config.config.studio.VMixMediaDirectory),

		literal<TimelineObjVMixOverlayInputOFF>({
			id: 'overlayOff1',
			enable: {
				start: params.piece.duration - 1,
				duration: 1
			},
			layer: VMixLLayer.VMixProgram,
			content: {
				deviceType: DeviceType.VMIX,
				type: TimelineContentTypeVMix.OVERLAY_INPUT_OFF,
				overlay: 4
			}
		})
	])

	p.content = content

	return p
}

/**
 * Returns the VMixTransitionType represented by a string.
 * If no match is found, Cut is returned.
 * @param {string} str Transtion style to match.
 */
function transitionFromString (str: string, defaultTransition: VMixTransitionType): VMixTransitionType {
	if (str.match(/crosszoom/i)) {
		return VMixTransitionType.CrossZoom
	} else if (str.match(/cube/i)) {
		return VMixTransitionType.Cube
	} else if (str.match(/cubezoom/i)) {
		return VMixTransitionType.CubeZoom
	} else if (str.match(/cut/i)) {
		return VMixTransitionType.Cut
	} else if (str.match(/fade/i)) {
		return VMixTransitionType.Fade
	} else if (str.match(/fly/i)) {
		return VMixTransitionType.Fly
	} else if (str.match(/flyrotate/i)) {
		return VMixTransitionType.FlyRotate
	} else if (str.match(/merge/i)) {
		return VMixTransitionType.Merge
	} else if (str.match(/slide/i)) {
		return VMixTransitionType.Slide
	} else if (str.match(/slidereverse/i)) {
		return VMixTransitionType.SlideReverse
	} else if (str.match(/verticalslide/i)) {
		return VMixTransitionType.VerticalSlide
	} else if (str.match(/verticalslidereverse/i)) {
		return VMixTransitionType.VerticalSlideReverse
	} else if (str.match(/verticalwipe/i)) {
		return VMixTransitionType.VerticalWipe
	} else if (str.match(/verticalwipereverse/i)) {
		return VMixTransitionType.VerticalWipeReverse
	} else if (str.match(/wipe/i)) {
		return VMixTransitionType.Wipe
	} else if (str.match(/wipereverse/i)) {
		return VMixTransitionType.WipeReverse
	} else if (str.match(/zoom/i)) {
		return VMixTransitionType.Zoom
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
	creator: (params: PieceParams, transition: VMixTransitionType) => IBlueprintPiece | IBlueprintAdLibPiece,
	pieces: IBlueprintPiece[],
	adLibPieces: IBlueprintAdLibPiece[],
	transitionType?: VMixTransitionType
) {
	let transition = transitionType
	if (params.piece.transition) transition = transitionFromString(params.piece.transition, transitionType || VMixTransitionType.Cut)

	let p = creator(params, transition || VMixTransitionType.Cut)
	if (p.content) {
		if (isAdLibPiece(p)) {
			adLibPieces.push(p as IBlueprintAdLibPiece)
		} else {
			pieces.push(p as IBlueprintPiece)
		}
	}
}
