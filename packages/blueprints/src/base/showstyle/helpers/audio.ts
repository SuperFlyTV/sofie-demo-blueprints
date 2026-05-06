import { TSR } from '@sofie-automation/blueprints-integration'
import { assertNever, literal } from '../../../common/util.js'
import { AudioSourceType, SourceType, StudioConfig, VisionMixerDevice } from '../../studio/helpers/config.js'
import { SisyfosLayers } from '../../studio/layers.js'
import { TimelineBlueprintExt } from '../../studio/customTypes.js'
import { ObsSourceConfig, SiyfosSourceConfig } from '../../../$schemas/generated/main-studio-config.js'
import { getOBSAudioInputName, getOBSInputAudioLayer } from '../../studio/applyConfig/mappings/obs.js'
export { getOBSAudioBaseline, getOBSDownstreamKeyerBaseline } from '../../studio/helpers/obs.js'

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
): TimelineBlueprintExt<TSR.TimelineContentSisyfosChannels | TSR.TimelineContentOBSInputAudio>[] {
	if (config.visionMixer.type === VisionMixerDevice.OBS) {
		return getOBSPrimaryAudioObjects(config, primaries)
	}

	return [
		{
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
		},
	]
}

export function getAudioPrimaryObject(
	config: StudioConfig,
	primaries: { type: AudioSourceType; index: number; isOn?: boolean }[]
): TimelineBlueprintExt<TSR.TimelineContentSisyfosChannels | TSR.TimelineContentOBSInputAudio>[] {
	return getAudioObjectOnLayer(config, SisyfosLayers.Primary, primaries)
}

function getOBSPrimaryAudioObjects(
	config: StudioConfig,
	primaries: { type: AudioSourceType; index: number; isOn?: boolean }[]
): TimelineBlueprintExt<TSR.TimelineContentOBSInputAudio>[] {
	return primaries
		.map((primary) => {
			const sourceType = getOBSSourceTypeForAudioType(primary.type)
			if (!sourceType) return undefined

			const sourceEntry = Object.entries<ObsSourceConfig>(config.obsSources).filter(
				([, source]) => source.type === sourceType && !!getOBSAudioInputName(source)
			)[primary.index]
			if (!sourceEntry) return undefined

			return literal<TimelineBlueprintExt<TSR.TimelineContentOBSInputAudio>>({
				id: '',
				enable: { start: 0 },
				layer: getOBSInputAudioLayer(sourceEntry[0]),
				content: {
					deviceType: TSR.DeviceType.OBS,
					type: TSR.TimelineContentTypeOBS.INPUT_AUDIO,
					mute: primary.isOn === undefined ? false : !primary.isOn,
				},
				priority: 1,
			})
		})
		.filter((tlObject): tlObject is TimelineBlueprintExt<TSR.TimelineContentOBSInputAudio> => !!tlObject)
}

function getOBSSourceTypeForAudioType(type: AudioSourceType): SourceType | undefined {
	switch (type) {
		case AudioSourceType.Host:
			return SourceType.Camera
		case AudioSourceType.Remote:
			return SourceType.Remote
		case AudioSourceType.Playback:
			return SourceType.MediaPlayer
		case AudioSourceType.Guest:
			return undefined
		default:
			assertNever(type)
			return undefined
	}
}
