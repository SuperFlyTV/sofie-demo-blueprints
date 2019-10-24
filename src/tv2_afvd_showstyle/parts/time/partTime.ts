import * as Countable from 'countable'
import { PartDefinition } from '../../../tv2_afvd_showstyle/inewsConversion/converters/ParseBody'

export function PartTime(partDefinition: PartDefinition, totalWords: number): number {
	const storyDuration = Number(partDefinition.fields.audioTime) * 1000 || 0
	let wordCount: undefined | number
	if (partDefinition.script) {
		if (partDefinition.script) {
			Countable.count(partDefinition.script, (data: any) => {
				console.log(data)
				wordCount = data.words
			})
		}
		// tslint:disable-next-line:no-empty
		while (wordCount === undefined) {}
	}
	const partTime = wordCount ? (wordCount / totalWords) * storyDuration : 0
	return partTime
}
