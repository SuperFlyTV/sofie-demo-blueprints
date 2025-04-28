import { SourceType, StudioConfig, VisionMixerType } from '../../studio0/helpers/config'

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
	let sourcesOfType = Object.values(config.atemSources).filter((s) => s.type === rawInfo.type)

	if (config.visionMixerType === VisionMixerType.VMix) {
		sourcesOfType = Object.values(config.vmixSources).filter((s) => s.type === rawInfo.type)
	}

	const input = sourcesOfType[rawInfo.id - 1]

	return {
		...rawInfo,
		input: input && input.input,
	}
}
