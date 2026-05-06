import { TSR } from '@sofie-automation/blueprints-integration'
import { literal } from '../../../common/util.js'
import { ObsSourceConfig, SourceType, StudioConfig } from '../../../$schemas/generated/main-studio-config.js'
import { TimelineBlueprintExt } from '../customTypes.js'
import { getOBSAudioInputName, getOBSInputAudioLayer } from '../applyConfig/mappings/obs.js'
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

export function getOBSDownstreamKeyerBaseline(
	config: StudioConfig
): TimelineBlueprintExt<TSR.TimelineContentOBSDownstreamKeyer>[] {
	const configuredDskSource = config.obsDownstreamKeyerSourceId
		? config.obsSources[config.obsDownstreamKeyerSourceId]
		: undefined

	const dskSceneName =
		configuredDskSource?.sceneName ||
		Object.values<ObsSourceConfig>(config.obsSources).find(
			(source) => source.type === SourceType.Graphics && !!source.sceneName
		)?.sceneName

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
