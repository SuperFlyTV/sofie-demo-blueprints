import { TSR } from '@sofie-automation/blueprints-integration'
import { assertNever, literal } from '../../../common/util.js'
import { AudioSourceType, StudioConfig } from '../../studio/helpers/config.js'
import { SisyfosLayers } from '../../studio/layers.js'
import { TimelineBlueprintExt } from '../../studio/customTypes.js'
import { SiyfosSourceConfig } from '../../../$schemas/generated/main-studio-config.js'

// note - studio baseline and showstyle baseline are the same for now
export function getSisyfosBaseline(config: StudioConfig): (TSR.SisyfosChannelOptions & { mappedLayer: string })[] {
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

function getOverridePriorityByLayer(layer: SisyfosLayers) {
	switch (layer) {
		case SisyfosLayers.Baseline:
			return -10
		case SisyfosLayers.Primary:
			return 1
		case SisyfosLayers.Guests:
			return 1
		case SisyfosLayers.HostOverride:
			return 10
		case SisyfosLayers.ForceMute:
			return 20
		default:
			assertNever(layer)
			return 0
	}
}

function getSisyfosPrimary(
	config: StudioConfig,
	primaries: { type: AudioSourceType; index: number; isOn?: boolean }[]
): (TSR.SisyfosChannelOptions & { mappedLayer: string })[] {
	return primaries
		.map((primary) => {
			const s = Object.values<SiyfosSourceConfig>(config.sisyfosSources).filter((s) => s.type === primary.type)[
				primary.index
			]
			return (
				s &&
				literal<TSR.SisyfosChannelOptions & { mappedLayer: string }>({
					mappedLayer: `sisyfos_source_${s.type}${primary.index}`,
					isPgm: primary.isOn === undefined ? 1 : primary.isOn ? 1 : 0,
				})
			)
		})
		.filter((c) => c !== undefined)
}

export function getAudioObjectOnLayer(
	config: StudioConfig,
	layer: SisyfosLayers,
	primaries: { type: AudioSourceType; index: number; isOn?: boolean }[]
): TimelineBlueprintExt<TSR.TimelineContentSisyfosChannels> {
	return {
		id: '',
		enable: {
			start: 0,
		},
		layer: layer,
		content: {
			deviceType: TSR.DeviceType.SISYFOS,
			type: TSR.TimelineContentTypeSisyfos.CHANNELS,
			overridePriority: getOverridePriorityByLayer(layer),

			channels: getSisyfosPrimary(config, primaries),
		},
		priority: 1,
	}
}

export function getAudioPrimaryObject(
	config: StudioConfig,
	primaries: { type: AudioSourceType; index: number; isOn?: boolean }[]
): TimelineBlueprintExt<TSR.TimelineContentSisyfosChannels> {
	return getAudioObjectOnLayer(config, SisyfosLayers.Primary, primaries)
}
