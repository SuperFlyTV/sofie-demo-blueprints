import { TSR } from '@sofie-automation/blueprints-integration'
import { literal } from '../../../common/util.js'
import { ObsSourceConfig, SourceType, StudioConfig } from '../../../$schemas/generated/main-studio-config.js'
import { TimelineBlueprintExt } from '../customTypes.js'
import {
	getOBSAudioInputName,
	getOBSInputAudioLayer,
	getOBSInputMediaLayer,
	getOBSSceneItemLayer,
} from '../applyConfig/mappings/obs.js'
import { OBSLayers } from '../layers.js'

export function getOBSAudioBaseline(config: StudioConfig): TimelineBlueprintExt<TSR.TimelineContentOBSInputAudio>[] {
	return Object.entries<ObsSourceConfig>(config.obsSources)
		.filter(([, source]) => !!getOBSAudioInputName(source))
		.map(([sourceId]) =>
			literal<TimelineBlueprintExt<TSR.TimelineContentOBSInputAudio>>({
				id: '',
				enable: { while: 1 },
				layer: getOBSInputAudioLayer(sourceId),
				content: {
					deviceType: TSR.DeviceType.OBS,
					type: TSR.TimelineContentTypeOBS.INPUT_AUDIO,
					mute: true,
				},
				priority: 0,
			})
		)
}

export function getOBSMediaPlayerBaseline(
	config: StudioConfig
): TimelineBlueprintExt<TSR.TimelineContentOBSInputMedia>[] {
	return Object.entries<ObsSourceConfig>(config.obsSources)
		.filter(([, source]) => source.type === SourceType.MediaPlayer && !!source.sourceName)
		.map(([sourceId]) =>
			literal<TimelineBlueprintExt<TSR.TimelineContentOBSInputMedia>>({
				id: '',
				enable: { while: 1 },
				layer: getOBSInputMediaLayer(sourceId),
				content: {
					deviceType: TSR.DeviceType.OBS,
					type: TSR.TimelineContentTypeOBS.INPUT_MEDIA,
					state: 'stopped',
					seek: 0,
				},
				priority: 0,
			})
		)
}

export function getOBSGraphicsBaseline(config: StudioConfig): TimelineBlueprintExt<TSR.TimelineContentOBSSceneItem>[] {
	return Object.entries<ObsSourceConfig>(config.obsSources)
		.filter(([, source]) => source.type === SourceType.Graphics && !!source.sceneName && !!source.sourceName)
		.map(([sourceId]) =>
			literal<TimelineBlueprintExt<TSR.TimelineContentOBSSceneItem>>({
				id: '',
				enable: { while: 1 },
				layer: getOBSSceneItemLayer(sourceId),
				content: {
					deviceType: TSR.DeviceType.OBS,
					type: TSR.TimelineContentTypeOBS.SCENE_ITEM,
					on: false,
				},
				priority: 0,
			})
		)
}

export function getOBSDownstreamKeyerSceneName(config: StudioConfig): string | undefined {
	const configuredDskSource = config.obsDownstreamKeyerSourceId
		? config.obsSources[config.obsDownstreamKeyerSourceId]
		: undefined

	return (
		configuredDskSource?.sceneName ||
		Object.values<ObsSourceConfig>(config.obsSources).find(
			(source) => source.type === SourceType.Graphics && !!source.sceneName
		)?.sceneName
	)
}

export function getOBSDownstreamKeyerBaseline(
	config: StudioConfig
): TimelineBlueprintExt<TSR.TimelineContentOBSDownstreamKeyer>[] {
	const dskSceneName = getOBSDownstreamKeyerSceneName(config)

	if (!dskSceneName) return []

	return [
		literal<TimelineBlueprintExt<TSR.TimelineContentOBSDownstreamKeyer>>({
			id: '',
			enable: { while: 1 },
			layer: OBSLayers.OBSDownstreamKeyer,
			content: {
				deviceType: TSR.DeviceType.OBS,
				type: TSR.TimelineContentTypeOBS.DOWNSTREAM_KEYER,
				sceneName: dskSceneName,
			},
			priority: 0,
		}),
	]
}
