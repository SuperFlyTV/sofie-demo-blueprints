import {
	BlueprintResultPart,
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
import { CueDefinitionJingle, CueType } from '../inewsConversion/converters/ParseCue'
import { CreatePartInvalid } from './invalid'
import { TimeFromFrames } from './time/frameTime'
import { PartTime } from './time/partTime'

export function CreatePartIntro(
	context: PartContext,
	config: BlueprintConfig,
	partDefinition: PartDefinition,
	totalWords: number
): BlueprintResultPart {
	const partTime = PartTime(partDefinition, totalWords)

	const jingleCue = partDefinition.cues.find(cue => {
		const parsedCue = cue
		return parsedCue.type === CueType.Jingle
	})

	if (!jingleCue) {
		context.warning(`Intro must contain a jingle`)
		return CreatePartInvalid(partDefinition)
	}

	const parsedJingle = jingleCue as CueDefinitionJingle

	if (!config.showStyle.JingleTimings) {
		context.warning(`Jingles have not been configured`)
		return CreatePartInvalid(partDefinition)
	}

	const jingle = config.showStyle.JingleTimings.find(jngl => jngl.JingleName === parsedJingle.clip)
	if (!jingle) {
		context.warning(`Jingle ${parsedJingle.clip} is not configured`)
		return CreatePartInvalid(partDefinition)
	}

	const overlapFrames = jingle.FramesOfAlpha

	if (overlapFrames === undefined) {
		context.warning(`Jingle ${parsedJingle.clip} does not have an out-duration set.`)
		return CreatePartInvalid(partDefinition)
	}

	const part = literal<IBlueprintPart>({
		externalId: partDefinition.externalId,
		title: PartType[partDefinition.type] + ' - ' + partDefinition.rawType,
		metaData: {},
		typeVariant: '',
		expectedDuration: partTime,
		displayDuration: partTime,
		autoNext: true,
		autoNextOverlap: TimeFromFrames(Number(overlapFrames))
	})

	const adLibPieces: IBlueprintAdLibPiece[] = []
	const pieces: IBlueprintPiece[] = []

	EvaluateCues(context, config, pieces, adLibPieces, partDefinition.cues, partDefinition)
	AddScript(partDefinition, pieces, partTime, false)

	if (pieces.length === 0 && adLibPieces.length === 0) {
		return CreatePartInvalid(partDefinition)
	}

	return {
		part,
		adLibPieces,
		pieces
	}
}
