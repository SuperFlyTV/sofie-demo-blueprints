import { BlueprintMappings, BlueprintMapping, TSR, LookaheadMode } from '@sofie-automation/blueprints-integration'
import { literal } from '../../../../common/util.js'
import { BlueprintConfig, OutputConfig } from '../../helpers/config.js'
import { AtemLayers } from './layers.js'

export function getAtemMappings(config: BlueprintConfig): BlueprintMappings {
	const mappings: BlueprintMappings = {
		[AtemLayers.AtemMeProgram]: literal<BlueprintMapping<TSR.MappingAtemMixEffect>>({
			device: TSR.DeviceType.ATEM,
			deviceId: 'atem0',
			lookahead: LookaheadMode.NONE,

			options: { mappingType: TSR.MappingAtemType.MixEffect, index: 0 },
		}),
		[AtemLayers.AtemMePreview]: literal<BlueprintMapping<TSR.MappingAtemMixEffect>>({
			device: TSR.DeviceType.ATEM,
			deviceId: 'atem0',
			lookahead: LookaheadMode.PRELOAD,

			options: { mappingType: TSR.MappingAtemType.MixEffect, index: 0 },
		}),
		[AtemLayers.AtemDskGraphics]: literal<BlueprintMapping<TSR.MappingAtemDownStreamKeyer>>({
			device: TSR.DeviceType.ATEM,
			deviceId: 'atem0',
			lookahead: LookaheadMode.NONE,

			options: { mappingType: TSR.MappingAtemType.DownStreamKeyer, index: 0 },
		}),
		[AtemLayers.AtemSuperSourceProps]: literal<BlueprintMapping<TSR.MappingAtemSuperSourceProperties>>({
			device: TSR.DeviceType.ATEM,
			deviceId: 'atem0',
			lookahead: LookaheadMode.NONE,

			options: { mappingType: TSR.MappingAtemType.SuperSourceProperties, index: 0 },
		}),
		[AtemLayers.AtemSuperSourceBoxes]: literal<BlueprintMapping<TSR.MappingAtemSuperSourceBox>>({
			device: TSR.DeviceType.ATEM,
			deviceId: 'atem0',
			lookahead: LookaheadMode.WHEN_CLEAR,
			lookaheadMaxSearchDistance: 1,

			options: { mappingType: TSR.MappingAtemType.SuperSourceBox, index: 0 },
		}),
	}

	for (const output of Object.values<OutputConfig>(config.studio.atemOutputs)) {
		const i = output.output - 1
		mappings[`atem_aux_${i}`] = literal<BlueprintMapping<TSR.MappingAtemAuxilliary>>({
			device: TSR.DeviceType.ATEM,
			deviceId: 'atem0',
			lookahead: LookaheadMode.NONE,
			options: {
				mappingType: TSR.MappingAtemType.Auxilliary,
				index: i,
			},
		})
	}

	return mappings
}
