import { BlueprintMappings, ICommonContext, LookaheadMode, TSR } from '@sofie-automation/blueprints-integration'
import { BlueprintConfig, VisionMixerDevice } from '../../helpers/config.js'
import { getVMixMappings } from './vmix.js'
import { getAtemMappings } from './atem.js'
import { getSisyfosMappings } from './sisyfos.js'
import { getCasparCGMappings } from './casparcg.js'
import { AsbtractLayers } from './layers.js'

export function getMappingsDefaults(context: ICommonContext, config: BlueprintConfig): BlueprintMappings {
	console.log('getMappingsDefaults', config)
	//ToDo: Split this up into files with specific mappings for each device:
	const mappings: BlueprintMappings = {
		[AsbtractLayers.CoreAbstract]: {
			device: TSR.DeviceType.ABSTRACT,
			deviceId: 'abstract0',
			lookahead: LookaheadMode.NONE,
			options: {},
		},
		...getSisyfosMappings(config),
		...getCasparCGMappings(config),
	}

	switch (config.studio.visionMixer.type) {
		case VisionMixerDevice.Atem:
			Object.assign(mappings, getAtemMappings(config))
			break
		case VisionMixerDevice.VMix:
			Object.assign(mappings, getVMixMappings(config.studio.vmixSources))
			break
		default:
			context.logError('Unknown vision mixer type: ' + config.studio.visionMixer.type)
			break
	}

	return mappings
}
