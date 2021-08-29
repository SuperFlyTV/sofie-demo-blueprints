import { BlueprintMapping, BlueprintMappings, LookaheadMode, TSR } from '@sofie-automation/blueprints-integration'
import { literal } from '../../common/util'
import { AsbtractLayers, AtemLayers, CasparCGLayers } from '../layers'

export default literal<BlueprintMappings>({
	[AsbtractLayers.CoreAbstract]: {
		device: TSR.DeviceType.ABSTRACT,
		deviceId: 'abstract0',
		lookahead: LookaheadMode.NONE,
	},

	[AtemLayers.AtemMeProgram]: literal<TSR.MappingAtem & BlueprintMapping>({
		device: TSR.DeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.NONE,

		mappingType: TSR.MappingAtemType.MixEffect,
		index: 0,
	}),
	[AtemLayers.AtemMePreview]: literal<TSR.MappingAtem & BlueprintMapping>({
		device: TSR.DeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.PRELOAD,

		mappingType: TSR.MappingAtemType.MixEffect,
		index: 0,
	}),
	[AtemLayers.AtemDskGraphics]: literal<TSR.MappingAtem & BlueprintMapping>({
		device: TSR.DeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.NONE,

		mappingType: TSR.MappingAtemType.DownStreamKeyer,
		index: 0,
	}),
	[AtemLayers.AtemSuperSourceProps]: literal<TSR.MappingAtem & BlueprintMapping>({
		device: TSR.DeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.NONE,

		mappingType: TSR.MappingAtemType.SuperSourceProperties,
		index: 0,
	}),
	[AtemLayers.AtemSuperSourceBoxes]: literal<TSR.MappingAtem & BlueprintMapping>({
		device: TSR.DeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.WHEN_CLEAR,
		lookaheadMaxSearchDistance: 1,

		mappingType: TSR.MappingAtemType.SuperSourceBox,
		index: 0,
	}),

	[CasparCGLayers.CasparCGClipPlayer]: literal<TSR.MappingCasparCG & BlueprintMapping>({
		device: TSR.DeviceType.CASPARCG,
		deviceId: 'casparcg0',
		lookahead: LookaheadMode.NONE,

		channel: 1,
		layer: 110,
	}),
	[CasparCGLayers.CasparCGClipPlayerPreview]: literal<TSR.MappingCasparCG & BlueprintMapping>({
		device: TSR.DeviceType.CASPARCG,
		deviceId: 'casparcg0',
		lookahead: LookaheadMode.NONE,

		channel: 1,
		layer: 100,
	}),

	[CasparCGLayers.CasparCGEffectsPlayer]: literal<TSR.MappingCasparCG & BlueprintMapping>({
		device: TSR.DeviceType.CASPARCG,
		deviceId: 'casparcg0',
		lookahead: LookaheadMode.NONE,

		channel: 2,
		layer: 200,
	}),
	[CasparCGLayers.CasparCGGraphicsTicker]: literal<TSR.MappingCasparCG & BlueprintMapping>({
		device: TSR.DeviceType.CASPARCG,
		deviceId: 'casparcg0',
		lookahead: LookaheadMode.NONE,

		channel: 2,
		layer: 110,
	}),
	[CasparCGLayers.CasparCGGraphicsLowerThird]: literal<TSR.MappingCasparCG & BlueprintMapping>({
		device: TSR.DeviceType.CASPARCG,
		deviceId: 'casparcg0',
		lookahead: LookaheadMode.NONE,

		channel: 2,
		layer: 111,
	}),
	[CasparCGLayers.CasparCGGraphicsStrap]: literal<TSR.MappingCasparCG & BlueprintMapping>({
		device: TSR.DeviceType.CASPARCG,
		deviceId: 'casparcg0',
		lookahead: LookaheadMode.NONE,

		channel: 2,
		layer: 112,
	}),
	[CasparCGLayers.CasparCGGraphicsLogo]: literal<TSR.MappingCasparCG & BlueprintMapping>({
		device: TSR.DeviceType.CASPARCG,
		deviceId: 'casparcg0',
		lookahead: LookaheadMode.NONE,

		channel: 2,
		layer: 113,
	}),
	[CasparCGLayers.CasparCGAudioBed]: literal<TSR.MappingCasparCG & BlueprintMapping>({
		device: TSR.DeviceType.CASPARCG,
		deviceId: 'casparcg0',
		lookahead: LookaheadMode.NONE,

		channel: 2,
		layer: 80,
	}),
})

export function getAllAuxMappings(total: number): BlueprintMappings {
	const mappings: BlueprintMappings = {}

	for (let i = 0; i < total; i++) {
		mappings[`atem_aux_${i}`] = literal<TSR.MappingAtem & BlueprintMapping>({
			device: TSR.DeviceType.ATEM,
			deviceId: 'atem0',
			lookahead: LookaheadMode.NONE,

			mappingType: TSR.MappingAtemType.Auxilliary,
			index: i,
		})
	}

	return mappings
}
