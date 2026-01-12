import {
	ExpectedPackage,
	IBlueprintAdLibPiece,
	ICommonContext,
	PieceLifespan,
	TSR,
} from '@sofie-automation/blueprints-integration'
import { ObjectType, SomeObject, VideoObject } from '../../../common/definitions/objects.js'
import { assertUnreachable, literal } from '../../../common/util.js'
import { SourceType, StudioConfig, VisionMixerDevice } from '../../studio/helpers/config.js'
import { CasparCGLayers } from '../../studio/layers.js'
import { getOutputLayerForSourceLayer, SourceLayer } from '../applyconfig/layers.js'
import { createVisionMixerObjects } from './visionMixer.js'
import { TimelineBlueprintExt } from '../../studio/customTypes.js'
import { InputConfig, VmixInputConfig } from '../../..//$schemas/generated/main-studio-config.js'

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
	if (config.visionMixer.type === VisionMixerDevice.Atem) {
		const mediaplayerInput = Object.values<InputConfig>(config.atemSources).find(
			(s) => s.type === SourceType.MediaPlayer
		)

		return mediaplayerInput
	} else if (config.visionMixer.type === VisionMixerDevice.VMix) {
		const mediaplayerInput = Object.values<VmixInputConfig>(config.vmixSources).find(
			(s) => s.type === SourceType.MediaPlayer
		)

		return mediaplayerInput
	} else {
		assertUnreachable(config.visionMixer.type)
	}
}

export function clipToAdlib(
	context: ICommonContext,
	config: StudioConfig,
	clipObject: VideoObject
): IBlueprintAdLibPiece {
	const props = parseClipProps(clipObject)
	const visionMixerInput = getClipPlayerInput(config)

	return literal<IBlueprintAdLibPiece>({
		_rank: 0,
		externalId: clipObject.id,
		name: `${props.fileName || 'Missing file name'}`,
		lifespan: PieceLifespan.WithinPart,
		sourceLayerId: SourceLayer.VO,
		outputLayerId: getOutputLayerForSourceLayer(SourceLayer.VO),
		expectedPackages: [
			literal<ExpectedPackage.ExpectedPackageMediaFile>({
				_id: context.getHashId(props.fileName, true),
				layers: [CasparCGLayers.CasparCGClipPlayer1],
				type: ExpectedPackage.PackageType.MEDIA_FILE,
				content: {
					filePath: props.fileName,
				},
				version: {},
				contentVersionHash: '',
				sources: [],
				sideEffect: {},
			}),
		],
		content: {
			fileName: props.fileName,

			timelineObjects: [
				...createVisionMixerObjects(config, visionMixerInput?.input || 0, config.casparcgLatency),

				literal<TimelineBlueprintExt<TSR.TimelineContentCCGMedia>>({
					id: '',
					enable: { start: 0 },
					layer: CasparCGLayers.CasparCGClipPlayer1,
					content: {
						deviceType: TSR.DeviceType.CASPARCG,
						type: TSR.TimelineContentTypeCasparCg.MEDIA,

						file: props.fileName,
					},
					priority: 1,
				}),
			],
		},
	})
}

export function parseClipsFromObjects(
	context: ICommonContext,
	config: StudioConfig,
	objects: SomeObject[]
): IBlueprintAdLibPiece[] {
	const clips = objects.filter((o): o is VideoObject => o.objectType === ObjectType.Video)

	return clips.map((o) => clipToAdlib(context, config, o))
}
