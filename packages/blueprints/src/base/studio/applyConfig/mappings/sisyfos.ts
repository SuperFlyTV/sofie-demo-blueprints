import { BlueprintMappings, BlueprintMapping, TSR, LookaheadMode } from '@sofie-automation/blueprints-integration'
import { literal } from '../../../../common/util.js'
import { AudioSourceType, BlueprintConfig, SiyfosSourceConfig } from '../../helpers/config.js'
import { SisyfosLayers } from './layers.js'

export function getSisyfosMappings(config: BlueprintConfig): BlueprintMappings {
	const mappings: BlueprintMappings = {
		[SisyfosLayers.Baseline]: literal<BlueprintMapping<TSR.MappingSisyfosChannels>>({
			device: TSR.DeviceType.SISYFOS,
			deviceId: 'sisyfos0',
			lookahead: LookaheadMode.NONE,
			options: {
				mappingType: TSR.MappingSisyfosType.Channels,
			},
		}),
		[SisyfosLayers.Primary]: literal<BlueprintMapping<TSR.MappingSisyfosChannels>>({
			device: TSR.DeviceType.SISYFOS,
			deviceId: 'sisyfos0',
			lookahead: LookaheadMode.NONE,

			options: { mappingType: TSR.MappingSisyfosType.Channels },
		}),
		[SisyfosLayers.Guests]: literal<BlueprintMapping<TSR.MappingSisyfosChannels>>({
			device: TSR.DeviceType.SISYFOS,
			deviceId: 'sisyfos0',
			lookahead: LookaheadMode.NONE,

			options: { mappingType: TSR.MappingSisyfosType.Channels },
		}),
		[SisyfosLayers.ForceMute]: literal<BlueprintMapping<TSR.MappingSisyfosChannels>>({
			device: TSR.DeviceType.SISYFOS,
			deviceId: 'sisyfos0',
			lookahead: LookaheadMode.NONE,

			options: { mappingType: TSR.MappingSisyfosType.Channels },
		}),
	}

	const pushSisyfosMappings = (type: AudioSourceType) => {
		const sources = Object.values<SiyfosSourceConfig>(config.studio.sisyfosSources).filter((m) => m.type === type)
		for (let i = 0; i < sources.length; i++) {
			mappings[`sisyfos_source_${type}${i}`] = literal<BlueprintMapping<TSR.MappingSisyfosChannel>>({
				device: TSR.DeviceType.SISYFOS,
				deviceId: 'sisyfos0',
				lookahead: LookaheadMode.NONE,
				options: {
					mappingType: TSR.MappingSisyfosType.Channel,
					channel: sources[i].source,
					setLabelToLayerName: false, // ??
				},
			})
		}
	}

	pushSisyfosMappings(AudioSourceType.Host)
	pushSisyfosMappings(AudioSourceType.Guest)
	pushSisyfosMappings(AudioSourceType.Remote)
	pushSisyfosMappings(AudioSourceType.Playback)

	return mappings
}
