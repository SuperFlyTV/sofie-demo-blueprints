import { SourceType, StudioConfig } from '../../studio/helpers/config.js'
import {
	InputConfig,
	ObsSourceConfig,
	VisionMixerDevice,
	VmixInputConfig,
} from '../../..//$schemas/generated/main-studio-config.js'

export interface RawSourceInfo {
	type: SourceType
	/** 1-based number */
	id: number
}

export interface SourceInfo extends RawSourceInfo {
	input: number | string
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
	let sourcesOfType = Object.values<InputConfig>(config.atemSources).filter((s) => s.type === rawInfo.type)

	if (config.visionMixer.type === VisionMixerDevice.VMix) {
		sourcesOfType = Object.values<VmixInputConfig>(config.vmixSources).filter((s) => s.type === rawInfo.type)
	} else if (config.visionMixer.type === VisionMixerDevice.OBS) {
		const obsSource = Object.values<ObsSourceConfig>(config.obsSources).filter((s) => s.type === rawInfo.type)[
			rawInfo.id - 1
		]
		return {
			...rawInfo,
			input: obsSource?.sceneName || '',
		}
	}

	const input = sourcesOfType[rawInfo.id - 1]

	return {
		...rawInfo,
		input: input && input.input,
	}
}
