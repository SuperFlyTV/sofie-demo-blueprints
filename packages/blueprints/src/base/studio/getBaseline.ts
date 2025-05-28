import { BlueprintResultStudioBaseline, IStudioContext, TSR } from '@sofie-automation/blueprints-integration'
import { literal } from '../../common/util.js'
import { AudioSourceType, StudioConfig } from './helpers/config.js'
import { SisyfosLayers } from './layers.js'
import { TimelineBlueprintExt } from './customTypes.js'
import { OutputConfig, SiyfosSourceConfig } from '../../$schemas/generated/main-studio-config.js'

function getSisyfosBaseline(config: StudioConfig): (TSR.SisyfosChannelOptions & { mappedLayer: string })[] {
	const channels: (TSR.SisyfosChannelOptions & { mappedLayer: string })[] = []
	const addChannelsFromType = (type: AudioSourceType) =>
		Object.values<SiyfosSourceConfig>(config.sisyfosSources)
			.filter((s) => s.type === type)
			.forEach((s, i) => {
				channels.push(
					literal<TSR.SisyfosChannelOptions & { mappedLayer: string }>({
						mappedLayer: `sisyfos_source_${s.type}${i}`,
						isPgm: 0,
					})
				)
			})

	addChannelsFromType(AudioSourceType.Host)
	addChannelsFromType(AudioSourceType.Guest)
	addChannelsFromType(AudioSourceType.Remote)
	addChannelsFromType(AudioSourceType.Playback)

	return channels
}

export function getBaseline(context: IStudioContext): BlueprintResultStudioBaseline {
	const config = (context.getStudioConfig() as any).studio as StudioConfig
	context.logError('getBaseline - config' + JSON.stringify(config))

	return {
		timelineObjects: [
			literal<TimelineBlueprintExt<TSR.TimelineContentSisyfosChannels>>({
				id: '',
				enable: {
					while: 1,
				},
				layer: SisyfosLayers.Baseline,
				content: {
					deviceType: TSR.DeviceType.SISYFOS,
					type: TSR.TimelineContentTypeSisyfos.CHANNELS,

					channels: getSisyfosBaseline(config),
				},
				priority: 1,
			}),
			...Object.values<OutputConfig>(config.atemOutputs).map((output) =>
				literal<TimelineBlueprintExt<TSR.TimelineContentAtemAUX>>({
					id: '',
					enable: { while: 1 },
					priority: 0,
					layer: `atem_aux_${output.output - 1}`,
					content: {
						deviceType: TSR.DeviceType.ATEM,
						type: TSR.TimelineContentTypeAtem.AUX,

						aux: {
							input: output.source,
						},
					},
				})
			),
		],
		expectedPackages: [],
	}
}
