import { SourceType, StudioConfig } from '../../studio/helpers/config.js'
import {
	InputConfig,
	SourceTypeVMix,
	VisionMixerDevice,
	VmixInputConfig,
} from '../../..//$schemas/generated/main-studio-config.js'

export interface RawSourceInfo {
	type: SourceType
	/** 1-based number */
	id: number
}

export interface SourceInfo extends RawSourceInfo {
	input: number
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

export function getSourceInfoFromRaw(config: StudioConfig, rawInfo: RawSourceInfo): SourceInfo {
	let input: InputConfig | undefined = undefined

	if (config.visionMixer.type === VisionMixerDevice.Atem) {
		const sourcesOfType = Object.values<InputConfig>(config.atemSources).filter((s) => s.type === rawInfo.type)
		input = sourcesOfType[rawInfo.id - 1]
	} else {
		const sourcesOfType = Object.values<VmixInputConfig>(config.vmixSources).filter(
			(s) => s.type === (rawInfo.type as any as SourceTypeVMix)
		)
		input = sourcesOfType[rawInfo.id - 1] as any as InputConfig
	}

	return {
		...rawInfo,
		input: input && input.input,
	}
}
