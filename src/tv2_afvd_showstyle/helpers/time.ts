import { IBlueprintPart } from 'tv-automation-sofie-blueprints-integration'
import { INewsStory } from '../inewsConversion/converters/ParseBody'

export function GetTimeFromPart(story: INewsStory): Partial<IBlueprintPart> {
	return {
		expectedDuration: Number(story.fields.totalTime),
		prerollDuration: 0
	}
}
