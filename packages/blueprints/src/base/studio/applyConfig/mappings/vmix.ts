import { BlueprintMapping, BlueprintMappings, LookaheadMode, TSR } from '@sofie-automation/blueprints-integration'
import { literal } from '../../../../common/util.js'
import { SourceType, StudioConfig } from '../../helpers/config.js'
import { VMixLayers } from '../../layers.js'
import { VmixInputConfig, VmixRegistryInputConfig } from '../../../../$schemas/generated/main-studio-config.js'
import {
	formatVmixMappingIndex,
	getVmixInputLayerId,
	getVmixMixPreviewLayerId,
	getVmixMixProgramLayerId,
	getVmixOverlayLayerId,
} from '../../helpers/vmixInputs.js'

export function getVMixMappings(config: StudioConfig): BlueprintMappings {
	const vmixSources = config.vmixSources
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

			options: { mappingType: TSR.MappingVmixType.Preview, index: 1, disableDefaults: true },
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

			options: {
				mappingType: TSR.MappingVmixType.Input,
				index: '' + multiviewSource.input,
				disableDefaults: true,
			},
		})
	}

	const additionalMixBuses = new Set<number>()

	for (const [key, entry] of Object.entries<VmixRegistryInputConfig>(config.vmixInputs ?? {})) {
		mappings[getVmixInputLayerId(key)] = literal<BlueprintMapping<TSR.MappingVmixInput>>({
			device: TSR.DeviceType.VMIX,
			deviceId: 'vmix0',
			lookahead: LookaheadMode.WHEN_CLEAR,
			lookaheadMaxSearchDistance: 1,

			options: {
				mappingType: TSR.MappingVmixType.Input,
				index: formatVmixMappingIndex(entry.input),
				disableDefaults: true,
			},
		})

		if (entry.overlay !== undefined) {
			mappings[getVmixOverlayLayerId(key)] = literal<BlueprintMapping<TSR.MappingVmixOverlay>>({
				device: TSR.DeviceType.VMIX,
				deviceId: 'vmix0',
				lookahead: LookaheadMode.NONE,

				options: {
					mappingType: TSR.MappingVmixType.Overlay,
					index: entry.overlay as 1 | 2 | 3 | 4,
				},
			})
		}

		if (entry.mix !== undefined && entry.mix > 1) {
			additionalMixBuses.add(entry.mix)
		}
	}

	for (const mix of additionalMixBuses) {
		const mixIndex = mix as 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16
		const programLayer = getVmixMixProgramLayerId(mix)
		const previewLayer = getVmixMixPreviewLayerId(mix)

		mappings[programLayer] = literal<BlueprintMapping<TSR.MappingVmixProgram>>({
			device: TSR.DeviceType.VMIX,
			deviceId: 'vmix0',
			lookahead: LookaheadMode.NONE,

			options: { mappingType: TSR.MappingVmixType.Program, index: mixIndex },
		})

		mappings[previewLayer] = literal<BlueprintMapping<TSR.MappingVmixPreview>>({
			device: TSR.DeviceType.VMIX,
			deviceId: 'vmix0',

			lookahead: LookaheadMode.WHEN_CLEAR,
			lookaheadMaxSearchDistance: 1,
			lookaheadDepth: 1,

			options: { mappingType: TSR.MappingVmixType.Preview, index: mixIndex, disableDefaults: true },
		})
	}

	return mappings
}
