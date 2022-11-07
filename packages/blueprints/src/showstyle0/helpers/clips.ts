import { IBlueprintAdLibPiece, PieceLifespan, TSR } from '@sofie-automation/blueprints-integration'
import { ObjectType, SomeObject, VideoObject } from '../../common/definitions/objects'
import { assertUnreachable, literal } from '../../common/util'
import { SourceType, StudioConfig, VisionMixerType } from '../../studio0/helpers/config'
import { CasparCGLayers } from '../../studio0/layers'
import { getOutputLayerForSourceLayer, SourceLayer } from '../layers'
import { createVisionMixerObjects } from './visionMixer'

export interface ClipProps {
	fileName: string
	duration?: number
	sourceDuration?: number
}

export function parseClipProps(object: VideoObject): ClipProps {
	return {
		fileName: object.clipName,
		duration: object.duration,
	}
}

export function parseClipEditorProps(object: VideoObject): ClipProps {
	return {
		fileName: object.attributes.fileName as string,
		duration: object.duration * 1000,
		sourceDuration: object.attributes.sourceDuration as number,
	}
}

export function getClipPlayerInput(config: StudioConfig): StudioConfig['atemSources'][any] | undefined {
	if (config.visionMixerType === VisionMixerType.Atem) {
		const mediaplayerInput = config.atemSources.find((s) => s.type === SourceType.MediaPlayer)

		return mediaplayerInput
	} else if (config.visionMixerType === VisionMixerType.VMix) {
		const mediaplayerInput = config.vmixSources.find((s) => s.type === SourceType.MediaPlayer)

		return mediaplayerInput
	} else {
		assertUnreachable(config.visionMixerType)
	}
}

export function clipToAdlib(config: StudioConfig, clipObject: VideoObject): IBlueprintAdLibPiece {
	const props = parseClipProps(clipObject)
	const visionMixerInput = getClipPlayerInput(config)

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
				...createVisionMixerObjects(config, visionMixerInput?.input || 0, config.casparcgLatency),

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

export function parseClipsFromObjects(config: StudioConfig, objects: SomeObject[]): IBlueprintAdLibPiece[] {
	const clips = objects.filter((o): o is VideoObject => o.objectType === ObjectType.Video)

	return clips.map((o) => clipToAdlib(config, o))
}
