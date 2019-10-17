import {
	BlueprintResultPart,
	IBlueprintAdLibPiece,
	IBlueprintPart,
	IBlueprintPiece,
	PartContext
} from 'tv-automation-sofie-blueprints-integration'
import { literal } from '../../common/util'
import { BlueprintConfig } from '../../tv2_afvd_showstyle/helpers/config'
import { EvaluateCues } from '../helpers/pieces/evaluateCues'
import { PartDefinition, PartType } from '../inewsConversion/converters/ParseBody'
import { CueType, ParseCue } from '../inewsConversion/converters/ParseCue'

export function CreatePartLive(
	context: PartContext,
	config: BlueprintConfig,
	partDefinition: PartDefinition
): BlueprintResultPart {
	const part = literal<IBlueprintPart>({
		externalId: partDefinition.externalId,
		title: PartType[partDefinition.type] + ' - ' + partDefinition.rawType,
		metaData: {},
		typeVariant: '',
		expectedDuration: 0
	})

	const adLibPieces: IBlueprintAdLibPiece[] = []
	const pieces: IBlueprintPiece[] = []

	const liveCue = partDefinition.cues.find(cue => {
		const parsedCue = ParseCue(cue)
		return parsedCue.type === CueType.Ekstern
	})

	if (liveCue) {
		partDefinition.cues.splice(partDefinition.cues.indexOf(liveCue), 1)
	} // TODO: Make AdLib live cue

	EvaluateCues(context, config, pieces, adLibPieces, partDefinition.cues, partDefinition)

	return {
		part,
		adLibPieces,
		pieces
	}
}
