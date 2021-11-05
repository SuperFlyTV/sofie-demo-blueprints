import { AtemSourceType, StudioConfig } from '../../studio0/helpers/config'

export interface RawSourceInfo {
	type: AtemSourceType
	id: number
}

export interface SourceInfo extends RawSourceInfo {
	input: number
}

export function findSource(
	input: string | number | boolean | undefined,
	type: AtemSourceType
): RawSourceInfo | undefined {
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
	const sourcesOfType = config.atemSources.filter((s) => s.type === rawInfo.type)
	const input = sourcesOfType[rawInfo.id - 1]

	return {
		...rawInfo,
		input: input && input.input,
	}
}
