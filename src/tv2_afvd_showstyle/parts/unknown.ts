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
import { PartDefinition, PartType } from '../inewsConversion/converters/ParseBody'
import { CueType } from '../inewsConversion/converters/ParseCue'
import { GetBreakerAutoNext } from './effekt'
import { CreatePartInvalid } from './invalid'
import { PartTime } from './time/partTime'

export function CreatePartUnknown(
	context: PartContext,
	config: BlueprintConfig,
	partDefinition: PartDefinition,
	totalWords: number
) {
	const partTime = PartTime(partDefinition, totalWords)

	let part = literal<IBlueprintPart>({
		externalId: partDefinition.externalId,
		title: PartType[partDefinition.type] + ' - ' + partDefinition.rawType,
		metaData: {},
		typeVariant: '',
		expectedDuration: partTime,
		displayDuration: partTime
	})

	const adLibPieces: IBlueprintAdLibPiece[] = []
	const pieces: IBlueprintPiece[] = []

	EvaluateCues(context, config, pieces, adLibPieces, partDefinition.cues, partDefinition)
	AddScript(partDefinition, pieces, partTime, false)
	part = { ...part, ...GetBreakerAutoNext(context, config, partDefinition) }

	if (pieces.length === 0 && adLibPieces.length === 0) {
		return CreatePartInvalid(partDefinition)
	}

	return {
		part,
		adLibPieces,
		pieces
	}
}
