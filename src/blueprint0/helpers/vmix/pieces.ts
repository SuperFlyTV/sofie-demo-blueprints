import _ = require('underscore')
import { literal } from '../../../common/util'
import { CreatePieceGeneric, checkAndPlaceOnScreen, createPieceTransitionGeneric } from '../pieces'
import { VMixTransitionType, TSRTimelineObj, TimelineObjVMixCameraActive, DeviceType, TimelineContentTypeVMix, TimelineObjVMixOverlayInputOFF, VMixCommand } from 'timeline-state-resolver-types'
import { PieceParams, Piece } from '../../../types/classes'
import { IBlueprintAdLibPiece, IBlueprintPiece, VTContent, GraphicsContent, CameraContent, TransitionContent } from 'tv-automation-sofie-blueprints-integration'
import { SourceLayer, VMixLLayer } from '../../../types/layers'
import { CreateContentVT, CreateContentGraphics, CreateContentCam } from '../content'
import { CreateEnableForTimelineObject } from '../timeline'
import { Attributes } from '../sources'
import { CreatePlaceOnScreenTimelineObject, CreateStartExternalTimelineObject, CreatePlayClipTimelineObject, CreateSwitchToClipTimelineObject, CreateOverlayTimelineObject, CreateSwitchToInputTimelineObject } from './timeline'

/**
 * Creates a transition piece.
 * @param {Piece} piece Piece to generate.
 * @param {number} duration Length of transition.
 */
export function CreatePieceInTransition (piece: Piece, duration: number): IBlueprintPiece {
	let p = createPieceTransitionGeneric(piece, duration)
	let content = literal<TransitionContent>({
		timelineObjects: _.compact<TSRTimelineObj>([])
	})
	p.content = content
	p.enable.start = 0

	return p
}

/**
 * Creates a cam piece.
 * @param {PieceParams} params Piece to create.
 */
export function CreatePieceVideo (params: PieceParams, transition: VMixTransitionType): IBlueprintAdLibPiece | IBlueprintPiece {
	let p = CreatePieceGeneric(params.piece)

	p.sourceLayerId = SourceLayer.PgmClip

	let content: VTContent = CreateContentVT(params.piece)

	if (checkAndPlaceOnScreen(p, params.piece.attributes)) {
		content.timelineObjects.push(
			CreatePlaceOnScreenTimelineObject(
				CreateEnableForTimelineObject(params.piece),
				VMixLLayer.VMixScreen,
				params.piece.clipName
			)
		)

		content.timelineObjects.push(
			CreateStartExternalTimelineObject(
				CreateEnableForTimelineObject(params.piece, 1),
				VMixLLayer.VMixScreen
			)
		)
	} else {
		content.timelineObjects = _.compact<TSRTimelineObj>([
			CreatePlayClipTimelineObject(CreateEnableForTimelineObject(params.piece), VMixLLayer.VMixProgram, params.piece.clipName, params.config.config.studio.VMixMediaDirectory)
		])

		if (params.context.match(/package/i)) {
			content.timelineObjects.push(
				CreateSwitchToClipTimelineObject(
					CreateEnableForTimelineObject(params.piece, 1),
					VMixLLayer.VMixProgram,
					params.piece.clipName,
					{
						number: 4,
						effect: VMixTransitionType.Fade,
						duration: 1000
					}
				)
			)

			content.timelineObjects.push(
				CreateSwitchToInputTimelineObject(
					{ start: params.piece.duration - 1000, duration: 1000 },
					VMixLLayer.VMixProgram,
					'1',
					{
						number: 4,
						effect: VMixTransitionType.Fade,
						duration: 1000
					}
				)
			)
		} else if (params.context.match(/head/i)) {
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

			content.timelineObjects.push(
				CreateSwitchToInputTimelineObject(
					{ start: params.piece.duration - 1000, duration: 1000 },
					VMixLLayer.VMixProgram,
					'1',
					{
						number: 4,
						effect: VMixTransitionType.Wipe,
						duration: 1000
					}
				)
			)
		} else if (params.context.match(/titles/i)) {
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

			content.timelineObjects.push(
				CreateSwitchToInputTimelineObject(
					{ start: params.piece.duration - 1000, duration: 1000 },
					VMixLLayer.VMixProgram,
					'1',
					{
						number: 4,
						effect: VMixTransitionType.Fade,
						duration: 1000
					}
				)
			)
		}
	}

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

	if (checkAndPlaceOnScreen(p, params.piece.attributes)) {
		content.timelineObjects.push(
			CreatePlaceOnScreenTimelineObject(
				CreateEnableForTimelineObject(params.piece),
				VMixLLayer.VMixScreen,
				params.piece.clipName
			)
		)

		content.timelineObjects.push(
			CreateStartExternalTimelineObject(
				CreateEnableForTimelineObject(params.piece, 1),
				VMixLLayer.VMixScreen
			)
		)
	} else {
		content.timelineObjects = _.compact<TSRTimelineObj>([
			CreatePlayClipTimelineObject(CreateEnableForTimelineObject(params.piece), VMixLLayer.VMixProgram, params.piece.clipName, params.config.config.studio.VMixMediaDirectory)
		])
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

		if (params.context.match(/head/i)) {
			if (transition === VMixTransitionType.Cut) {
				transition = VMixTransitionType.Wipe
			}
			content.timelineObjects.push(
				CreateSwitchToInputTimelineObject(
					{ start: params.piece.duration - 1000, duration: 1000 },
					VMixLLayer.VMixProgram,
					'1',
					{
						number: 4,
						effect: transition,
						duration: 1000
					}
				)
			)
		}
	}

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

	if (checkAndPlaceOnScreen(p, params.piece.attributes)) {
		content.timelineObjects.push(
			CreatePlaceOnScreenTimelineObject(
				CreateEnableForTimelineObject(params.piece),
				VMixLLayer.VMixScreen,
				params.piece.attributes[Attributes.CAMERA]
			)
		)

		content.timelineObjects.push(
			CreateStartExternalTimelineObject(
				CreateEnableForTimelineObject(params.piece, 1),
				VMixLLayer.VMixScreen
			)
		)
	} else {
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

		if (params.context.match(/head/i)) {
			if (transition === VMixTransitionType.Cut) {
				transition = VMixTransitionType.Wipe
			}
			content.timelineObjects.push(
				CreateSwitchToInputTimelineObject(
					{ start: params.piece.duration - 1000, duration: 1000 },
					VMixLLayer.VMixProgram,
					'1',
					{
						number: 4,
						effect: transition,
						duration: 1000
					}
				)
			)
		}
	}

	p.content = content

	return p
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
		CreateOverlayTimelineObject(CreateEnableForTimelineObject(params.piece), VMixLLayer.VMixProgram, params.piece.clipName, params.config.config.studio.VMixMediaDirectory),

		literal<TimelineObjVMixOverlayInputOFF>({
			id: '',
			enable: {
				start: params.piece.duration - 100,
				duration: 100
			},
			priority: 1,
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
