import { SourceType, StudioConfig } from '../../studio/helpers/config.js'
import { InputConfig, VisionMixerDevice, VmixInputConfig } from '../../../$schemas/generated/main-studio-config.js'
import { resolveVmixInput, resolveVmixInputByRole, VmixInputReference } from '../../studio/helpers/vmixInputs.js'

export interface RawSourceInfo {
	type: SourceType
	/** 1-based number */
	id: number
}

export interface SourceInfo extends RawSourceInfo {
	input: VmixInputReference | undefined
}

export function findSource(input: string | number | boolean | undefined, type: SourceType): RawSourceInfo | undefined {
	const match = (input + '').match(/(.*?)(\d+)(.*)/) // find the first number
	if (match) {
		return {
			id: Number(match[2]),
			type,
		}
	} else {
		return undefined
	}
}

function resolveRegistryInputForRawInfo(config: StudioConfig, rawInfo: RawSourceInfo): VmixInputReference | undefined {
	const roleCandidates = [`${rawInfo.type}${rawInfo.id}`, `${rawInfo.type}_${rawInfo.id}`]

	for (const role of roleCandidates) {
		const byRole = resolveVmixInputByRole(config, role)
		if (byRole) return byRole.input
	}

	const registryKey = Object.keys(config.vmixInputs ?? {})[rawInfo.id - 1]
	if (registryKey) {
		const byIndex = resolveVmixInput(config, registryKey)
		if (byIndex) return byIndex.input
	}

	return undefined
}

export function getSourceInfoFromRaw(config: StudioConfig, rawInfo: RawSourceInfo): SourceInfo {
	let sourcesOfType = Object.values<InputConfig>(config.atemSources).filter((s) => s.type === rawInfo.type)

	if (config.visionMixer.type === VisionMixerDevice.VMix) {
		sourcesOfType = Object.values<VmixInputConfig>(config.vmixSources).filter((s) => s.type === rawInfo.type)
	}

	const legacyInput = sourcesOfType[rawInfo.id - 1]
	const registryInput = resolveRegistryInputForRawInfo(config, rawInfo)

	return {
		...rawInfo,
		input: registryInput ?? (legacyInput && legacyInput.input),
	}
}
