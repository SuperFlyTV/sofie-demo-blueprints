import { PartDefinition } from '../../../tv2_afvd_showstyle/inewsConversion/converters/ParseBody'

export function PartTime(partDefinition: PartDefinition, totalWords: number): number {
	const storyDuration = Number(partDefinition.fields.audioTime) * 1000 || 0
	const partTime = (partDefinition.script.length / totalWords) * storyDuration
	return partTime > 0 ? partTime : 3000
}
