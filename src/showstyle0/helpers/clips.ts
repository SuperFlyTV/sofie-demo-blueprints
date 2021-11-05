import { IBlueprintAdLibPiece, PieceLifespan, TSR } from '@sofie-automation/blueprints-integration'
import { ObjectType, SomeObject, VideoObject } from '../../common/definitions/objects'
import { literal } from '../../common/util'
import { AtemSourceType, StudioConfig } from '../../studio0/helpers/config'
import { CasparCGLayers } from '../../studio0/layers'
import { getOutputLayerForSourceLayer, SourceLayer } from '../layers'
import { createAtemInputTimelineObjects } from './atem'

export interface ClipProps {
	fileName: string
	duration?: number
}

export function parseClipProps(object: VideoObject): ClipProps {
	return {
		fileName: object.clipName,
		duration: object.duration,
	}
}

export function getClipPlayerInput(config: StudioConfig): StudioConfig['atemSources'][any] | undefined {
	const mediaplayerInput = config.atemSources.find((s) => s.type === AtemSourceType.MediaPlayer)

	return mediaplayerInput
}

export function clipToAdlib(config: StudioConfig, clipObject: VideoObject): IBlueprintAdLibPiece {
	const props = parseClipProps(clipObject)
	const atemInput = getClipPlayerInput(config)

	return literal<IBlueprintAdLibPiece>({
		_rank: 0,
		externalId: clipObject.id,
		name: `${props.fileName || 'Missing file name'}`,
		lifespan: PieceLifespan.WithinPart,
		sourceLayerId: SourceLayer.VO,
		outputLayerId: getOutputLayerForSourceLayer(SourceLayer.VO),
		content: {
			fileName: props.fileName,

			timelineObjects: [
				...createAtemInputTimelineObjects(atemInput?.input || 0, config.casparcgLatency),

				literal<TSR.TimelineObjCCGMedia>({
					id: '',
					enable: { start: 0 },
					layer: CasparCGLayers.CasparCGClipPlayer,
					content: {
						deviceType: TSR.DeviceType.CASPARCG,
						type: TSR.TimelineContentTypeCasparCg.MEDIA,

						file: props.fileName,
					},
				}),
			],
		},
	})
}

export function parseClipsFromObjects(config: StudioConfig, objects: SomeObject[]) {
	const clips = objects.filter((o): o is VideoObject => o.objectType === ObjectType.Video)

	return clips.map((o) => clipToAdlib(config, o))
}
