import { BlueprintMapping, BlueprintMappings, LookaheadMode, TSR } from '@sofie-automation/blueprints-integration'
import { literal } from '../../common/util'
import { AudioSourceType, StudioConfig } from '../helpers/config'
import { AsbtractLayers, AtemLayers, CasparCGLayers, SisyfosLayers, VMixLayers } from '../layers'

export default literal<BlueprintMappings>({
	[AsbtractLayers.CoreAbstract]: {
		device: TSR.DeviceType.ABSTRACT,
		deviceId: 'abstract0',
		lookahead: LookaheadMode.NONE,
	},

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

	[SisyfosLayers.Baseline]: literal<TSR.MappingSisyfosChannels & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		lookahead: LookaheadMode.NONE,

		mappingType: TSR.MappingSisyfosType.CHANNELS,
	}),
	[SisyfosLayers.Primary]: literal<TSR.MappingSisyfosChannels & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		lookahead: LookaheadMode.NONE,

		mappingType: TSR.MappingSisyfosType.CHANNELS,
	}),
	[SisyfosLayers.Guests]: literal<TSR.MappingSisyfosChannels & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		lookahead: LookaheadMode.NONE,

		mappingType: TSR.MappingSisyfosType.CHANNELS,
	}),
	[SisyfosLayers.ForceMute]: literal<TSR.MappingSisyfosChannels & BlueprintMapping>({
		device: TSR.DeviceType.SISYFOS,
		deviceId: 'sisyfos0',
		lookahead: LookaheadMode.NONE,

		mappingType: TSR.MappingSisyfosType.CHANNELS,
	}),
})

export const AtemMappings = literal<BlueprintMappings>({
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
})

export const VMixMappings = literal<BlueprintMappings>({
	[VMixLayers.VMixMeProgram]: literal<TSR.MappingVMixAny & BlueprintMapping>({
		device: TSR.DeviceType.VMIX,
		deviceId: 'vmix0',
		lookahead: LookaheadMode.NONE,

		mappingType: TSR.MappingVMixType.Program,
		index: 1,
	}),
	[VMixLayers.VMixMePreview]: literal<TSR.MappingVMixAny & BlueprintMapping>({
		device: TSR.DeviceType.VMIX,
		deviceId: 'vmix0',

		lookahead: LookaheadMode.WHEN_CLEAR,
		lookaheadMaxSearchDistance: 1,
		lookaheadDepth: 1,

		mappingType: TSR.MappingVMixType.Preview,
		index: 1,
	}),
	[VMixLayers.VMixOverlayGraphics]: literal<TSR.MappingVMixOverlay & BlueprintMapping>({
		device: TSR.DeviceType.VMIX,
		deviceId: 'vmix0',
		lookahead: LookaheadMode.NONE,

		mappingType: TSR.MappingVMixType.Overlay,
		index: 1,
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

export function getDynamicSisyfosMappings(sisyfosSources: StudioConfig['sisyfosSources']): BlueprintMappings {
	const mappings: BlueprintMappings = {}
	const pushSisyfosMappings = (type: AudioSourceType) => {
		const sources = sisyfosSources.filter((m) => m.type === type)
		for (let i = 0; i < sources.length; i++) {
			mappings[`sisyfos_source_${type}${i}`] = literal<TSR.MappingSisyfosChannel & BlueprintMapping>({
				device: TSR.DeviceType.SISYFOS,
				deviceId: 'sisyfos0',
				lookahead: LookaheadMode.NONE,

				mappingType: TSR.MappingSisyfosType.CHANNEL,
				channel: sources[i].source,
				setLabelToLayerName: false, // ??
			})
		}
	}

	pushSisyfosMappings(AudioSourceType.Host)
	pushSisyfosMappings(AudioSourceType.Guest)
	pushSisyfosMappings(AudioSourceType.Remote)
	pushSisyfosMappings(AudioSourceType.Playback)

	return mappings
}
