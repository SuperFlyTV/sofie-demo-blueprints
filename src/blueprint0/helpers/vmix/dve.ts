import _ = require('underscore')
import { CreateContentCam, CreateContentVT, CreateContentGraphics, CreateContentRemote } from '../content'
import { getStudioName } from '../studio'
import { SegmentContext, IBlueprintPiece, IBlueprintAdLibPiece, SplitsContent, SourceLayerType, CameraContent, GraphicsContent, RemoteContent, VTContent } from 'tv-automation-sofie-blueprints-integration'
import { SegmentConf, Piece, SourceMeta } from '../../../types/classes'
import { CreatePieceGeneric } from '../pieces'
import { SourceLayer, VMixLLayer } from '../../../types/layers'
import { TSRTimelineObj, TimelineObjVMixCameraActive, DeviceType, TimelineContentTypeVMix, TimelineObjVMixPlayClip, TimelineObjVMixOverlayInputByNameIn } from 'timeline-state-resolver-types'
import { literal } from '../../../common/util'
import { CreateEnableForTimelineObject } from '../timeline'
import { Attributes, GetInputValue } from '../sources'

export function CreateDVE (context: SegmentContext, config: SegmentConf, pieces: Piece[]): IBlueprintPiece | IBlueprintAdLibPiece | undefined {
	let dvePiece = pieces[0]
	if (dvePiece.objectType === 'split') {
		context.warning(`Split DVE type is not available for vMIX workflows`)
	} else {
		return createPIP(config, pieces)
	}

	return
}

/**
 * Creates a PIP.
 * @param {SegmentConf} config Segment config.
 * @param {Piece[]} pieces Pieces to create.
 * @param {number} width Frame width.
 * @param {number} height Frame height.
 */
export function createPIP (config: SegmentConf, pieces: Piece[]): IBlueprintPiece | IBlueprintAdLibPiece | undefined {
	let dvePiece = pieces[0]
	pieces = pieces.slice(1, 3)

	if (pieces.length !== 2) {
		config.context.warning(`Wrong number of sources in DVE for PIP. Need exactly two sources.`)
		return
	}

	let p = CreatePieceGeneric(dvePiece)
	p.sourceLayerId = SourceLayer.PgmSplit

	let content: SplitsContent = {
		dveConfiguration: {},
		boxSourceConfiguration: [],
		timelineObjects: _.compact<TSRTimelineObj>([
		])
	}

	switch (pieces[0].objectType) {
		case 'camera':
			content.timelineObjects.push(
				literal<TimelineObjVMixCameraActive>({
					id: '',
					enable: CreateEnableForTimelineObject(pieces[0]),
					priority: 1,
					layer: VMixLLayer.VMixProgram,
					content: {
						deviceType: DeviceType.VMIX,
						type: TimelineContentTypeVMix.CAMERA_ACTIVE,
						camera: pieces[0].attributes[Attributes.CAMERA]
					}
				})
			)
			break
		default:
			content.timelineObjects.push(
				literal<TimelineObjVMixPlayClip>({
					id: '',
					enable: CreateEnableForTimelineObject(pieces[0], 1),
					priority: 1,
					layer: VMixLLayer.VMixProgram,
					content: {
						deviceType: DeviceType.VMIX,
						type: TimelineContentTypeVMix.PLAY_CLIP,
						clipName: pieces[0].clipName,
						mediaDirectory: config.config.studio.VMixMediaDirectory
					}
				})
			)
			break
	}

	content.boxSourceConfiguration.push(
		CreateBoxSourceConfiguration(config, pieces[0])
	)

	switch (pieces[1].objectType) {
		case 'camera':
			content.timelineObjects.push(
				literal<TimelineObjVMixOverlayInputByNameIn>({
					id: '',
					enable: CreateEnableForTimelineObject(pieces[1]),
					priority: 1,
					layer: VMixLLayer.VMixProgram,
					content: {
						deviceType: DeviceType.VMIX,
						type: TimelineContentTypeVMix.OVERLAY_INPUT_BY_NAME_IN,
						inputName: pieces[1].attributes[Attributes.CAMERA],
						mediaDirectory: config.config.studio.VMixMediaDirectory,
						overlay: 3
					}
				})
			)
			break
		default:
			content.timelineObjects.push(
				literal<TimelineObjVMixOverlayInputByNameIn>({
					id: '',
					enable: CreateEnableForTimelineObject(pieces[1], 1),
					priority: 1,
					layer: VMixLLayer.VMixProgram,
					content: {
						deviceType: DeviceType.VMIX,
						type: TimelineContentTypeVMix.OVERLAY_INPUT_BY_NAME_IN,
						inputName: pieces[1].clipName,
						mediaDirectory: config.config.studio.VMixMediaDirectory,
						overlay: 3
					}
				})
			)
			break
	}

	content.boxSourceConfiguration.push(
		CreateBoxSourceConfiguration(config, pieces[1])
	)

	p.content = content
	p.name = `PIP`

	return p
}

function CreateBoxSourceConfiguration (config: SegmentConf, piece: Piece): (VTContent | CameraContent | RemoteContent | GraphicsContent) & SourceMeta {
	switch (piece.objectType) {
		case 'camera':
			let boxContentCam = CreateContentCam(config, piece)

			return {...boxContentCam,
				...{
					type: SourceLayerType.CAMERA,
					studioLabel: getStudioName(config.context),
					switcherInput: GetInputValue(config.context, config.sourceConfig, piece.attributes[Attributes.CAMERA])
				}
			}
		case 'video':
			let boxContentVideo = CreateContentVT(piece)

			return {...boxContentVideo,
				...{
					type: SourceLayerType.VT,
					studioLabel: getStudioName(config.context),
					switcherInput: GetInputValue(config.context, config.sourceConfig, piece.clipName)
				}
			}
		case 'graphic':
			let boxContentGraphic = CreateContentGraphics(piece)

			return {...boxContentGraphic,
				...{
					type: SourceLayerType.GRAPHICS,
					studioLabel: getStudioName(config.context),
					switcherInput: GetInputValue(config.context, config.sourceConfig, piece.clipName)
				}
			}
		case 'remote':
		default:
			let boxContentRemote = CreateContentRemote(config, piece)

			return {...boxContentRemote,
				...{
					type: SourceLayerType.REMOTE,
					studioLabel: getStudioName(config.context),
					switcherInput: GetInputValue(config.context, config.sourceConfig, piece.attributes[Attributes.REMOTE])
				}
			}
	}
}
