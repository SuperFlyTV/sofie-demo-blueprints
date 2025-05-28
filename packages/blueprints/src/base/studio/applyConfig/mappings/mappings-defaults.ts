import { BlueprintMapping, BlueprintMappings, LookaheadMode, TSR } from '@sofie-automation/blueprints-integration'
import { literal } from '../../../../common/util.js'
import { AudioSourceType, SourceType, StudioConfig } from '../../helpers/config.js'
import { AsbtractLayers, AtemLayers, CasparCGLayers, SisyfosLayers, VMixLayers } from './layers.js'
import { VmixInputConfig, SiyfosSourceConfig } from '../../../../$schemas/generated/main-studio-config.js'

export default literal<BlueprintMappings>({
	[AsbtractLayers.CoreAbstract]: {
		device: TSR.DeviceType.ABSTRACT,
		deviceId: 'abstract0',
		lookahead: LookaheadMode.NONE,
		options: {},
	},

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
})

export const AtemMappings = literal<BlueprintMappings>({
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
})

export function getDynamicVMixMappings(vmixSources: StudioConfig['vmixSources']): BlueprintMappings {
	const mappings: BlueprintMappings = {
		[VMixLayers.VMixMeProgram]: literal<BlueprintMapping<TSR.MappingVmixProgram>>({
			device: TSR.DeviceType.VMIX,
			deviceId: 'vmix0',
			lookahead: LookaheadMode.NONE,

			options: { mappingType: TSR.MappingVmixType.Program, index: 1 },
		}),
		[VMixLayers.VMixMePreview]: literal<BlueprintMapping<TSR.MappingVmixPreview>>({
			device: TSR.DeviceType.VMIX,
			deviceId: 'vmix0',

			lookahead: LookaheadMode.WHEN_CLEAR,
			lookaheadMaxSearchDistance: 1,
			lookaheadDepth: 1,

			options: { mappingType: TSR.MappingVmixType.Preview, index: 1 },
		}),
		[VMixLayers.VMixOverlayGraphics]: literal<BlueprintMapping<TSR.MappingVmixOverlay>>({
			device: TSR.DeviceType.VMIX,
			deviceId: 'vmix0',
			lookahead: LookaheadMode.NONE,

			options: { mappingType: TSR.MappingVmixType.Overlay, index: 1 },
		}),
	}

	const multiviewSource = Object.values<VmixInputConfig>(vmixSources).find(
		(source) => source.type === SourceType.MultiView
	)
	if (multiviewSource) {
		/**
		 * Note that the word "MultiView" here does not refer to a traditional multiviewer used to monitor inputs and outputs in a studio.
		 * Instead, vMix uses this word to describe an input which has other inputs overlaid on top of it like a DVE.
		 * This is vMix's version of an ATEM SuperSource.
		 */
		mappings[VMixLayers.VMixDVEMultiView] = literal<BlueprintMapping<TSR.MappingVmixInput>>({
			device: TSR.DeviceType.VMIX,
			deviceId: 'vmix0',
			lookahead: LookaheadMode.WHEN_CLEAR,
			lookaheadMaxSearchDistance: 1,

			options: { mappingType: TSR.MappingVmixType.Input, index: '' + multiviewSource.input },
		})
	}

	return mappings
}

export function getAllAuxMappings(total: number): BlueprintMappings {
	const mappings: BlueprintMappings = {}

	for (let i = 0; i < total; i++) {
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

export function getDynamicSisyfosMappings(sisyfosSources: StudioConfig['sisyfosSources']): BlueprintMappings {
	const mappings: BlueprintMappings = {}
	const pushSisyfosMappings = (type: AudioSourceType) => {
		const sources = Object.values<SiyfosSourceConfig>(sisyfosSources).filter((m) => m.type === type)
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
