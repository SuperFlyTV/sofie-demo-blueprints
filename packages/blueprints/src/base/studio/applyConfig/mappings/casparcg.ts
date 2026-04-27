import { BlueprintMappings, BlueprintMapping, TSR, LookaheadMode } from '@sofie-automation/blueprints-integration'
import { literal } from '../../../../common/util.js'
import { BlueprintConfig } from '../../helpers/config.js'
import { CasparCGLayers } from './layers.js'

export function getCasparCGMappings(_config: BlueprintConfig): BlueprintMappings {
	const mappings: BlueprintMappings = {
		[CasparCGLayers.CasparCGClipPlayer1]: literal<BlueprintMapping<TSR.MappingCasparCGLayer>>({
			device: TSR.DeviceType.CASPARCG,
			deviceId: 'casparcg0',
			lookahead: LookaheadMode.NONE,

			options: {
				mappingType: TSR.MappingCasparCGType.Layer,
				channel: 1,
				layer: 110,
			},
		}),
		[CasparCGLayers.CasparCGClipPlayer2]: literal<BlueprintMapping<TSR.MappingCasparCGLayer>>({
			device: TSR.DeviceType.CASPARCG,
			deviceId: 'casparcg0',
			lookahead: LookaheadMode.NONE,

			options: {
				mappingType: TSR.MappingCasparCGType.Layer,
				channel: 2,
				layer: 110,
			},
		}),

		[CasparCGLayers.CasparCGClipPlayerPreview]: literal<BlueprintMapping<TSR.MappingCasparCGLayer>>({
			device: TSR.DeviceType.CASPARCG,
			deviceId: 'casparcg0',
			lookahead: LookaheadMode.NONE,
			options: {
				mappingType: TSR.MappingCasparCGType.Layer,
				channel: 1,
				layer: 100,
			},
		}),

		[CasparCGLayers.CasparCGEffectsPlayer]: literal<BlueprintMapping<TSR.MappingCasparCGLayer>>({
			device: TSR.DeviceType.CASPARCG,
			deviceId: 'casparcg0',
			lookahead: LookaheadMode.NONE,
			options: {
				mappingType: TSR.MappingCasparCGType.Layer,
				channel: 3,
				layer: 200,
			},
		}),
		[CasparCGLayers.CasparCGGraphicsTicker]: literal<BlueprintMapping<TSR.MappingCasparCGLayer>>({
			device: TSR.DeviceType.CASPARCG,
			deviceId: 'casparcg0',
			lookahead: LookaheadMode.NONE,
			options: {
				mappingType: TSR.MappingCasparCGType.Layer,
				channel: 3,
				layer: 110,
			},
		}),
		[CasparCGLayers.CasparCGGraphicsLowerThird]: literal<BlueprintMapping<TSR.MappingCasparCGLayer>>({
			device: TSR.DeviceType.CASPARCG,
			deviceId: 'casparcg0',
			lookahead: LookaheadMode.NONE,
			options: {
				mappingType: TSR.MappingCasparCGType.Layer,
				channel: 3,
				layer: 111,
			},
		}),
		[CasparCGLayers.CasparCGGraphicsStrap]: literal<BlueprintMapping<TSR.MappingCasparCGLayer>>({
			device: TSR.DeviceType.CASPARCG,
			deviceId: 'casparcg0',
			lookahead: LookaheadMode.NONE,
			options: {
				mappingType: TSR.MappingCasparCGType.Layer,
				channel: 3,
				layer: 112,
			},
		}),
		[CasparCGLayers.CasparCGGraphicsLogo]: literal<BlueprintMapping<TSR.MappingCasparCGLayer>>({
			device: TSR.DeviceType.CASPARCG,
			deviceId: 'casparcg0',
			lookahead: LookaheadMode.NONE,
			options: {
				mappingType: TSR.MappingCasparCGType.Layer,
				channel: 3,
				layer: 113,
			},
		}),
		[CasparCGLayers.CasparCGAudioBed]: literal<BlueprintMapping<TSR.MappingCasparCGLayer>>({
			device: TSR.DeviceType.CASPARCG,
			deviceId: 'casparcg0',
			lookahead: LookaheadMode.NONE,
			options: {
				mappingType: TSR.MappingCasparCGType.Layer,
				channel: 3,
				layer: 80,
			},
		}),
	}

	return mappings
}
