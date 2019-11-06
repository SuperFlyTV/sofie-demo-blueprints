import {
	IBlueprintAdLibPiece,
	IBlueprintPart,
	IBlueprintPiece,
	PartContext
} from 'tv-automation-sofie-blueprints-integration'
import { literal } from '../../common/util'
import { BlueprintConfig } from '../helpers/config'
import { EvaluateCues } from '../helpers/pieces/evaluateCues'
import { AddScript } from '../helpers/pieces/script'
import { PartDefinition } from '../inewsConversion/converters/ParseBody'
import { CueDefinition } from '../inewsConversion/converters/ParseCue'
import { GetBreakerAutoNext } from './effekt'
import { CreatePartInvalid } from './invalid'
import { PartTime } from './time/partTime'

export function CreatePartCueOnly(
	context: PartContext,
	config: BlueprintConfig,
	partDefinition: PartDefinition,
	id: string,
	title: string,
	cue: CueDefinition,
	totalWords: number
) {
	const partDefinitionWithID = { ...partDefinition, ...{ externalId: id } }
	const partTime = PartTime(partDefinitionWithID, totalWords)

	let part = literal<IBlueprintPart>({
		externalId: id,
		title,
		metaData: {},
		typeVariant: '',
		expectedDuration: partTime,
		displayDuration: partTime
	})

	const adLibPieces: IBlueprintAdLibPiece[] = []
	const pieces: IBlueprintPiece[] = []

	EvaluateCues(context, config, pieces, adLibPieces, [cue], partDefinitionWithID)
	AddScript(partDefinitionWithID, pieces, partTime, false)
	part = { ...part, ...GetBreakerAutoNext(context, config, partDefinitionWithID) }

	if (pieces.length === 0) {
		return CreatePartInvalid(partDefinitionWithID)
	}

	return {
		part,
		adLibPieces,
		pieces
	}
}
