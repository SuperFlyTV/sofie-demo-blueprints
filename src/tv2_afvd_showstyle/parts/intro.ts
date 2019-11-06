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

	const timings = config.showStyle.JingleTimings.split(',')
	let overlapFrames = -1
	timings.forEach(timing => {
		const props = timing.split(':')
		if (props[0] && props[1]) {
			if (props[0] === parsedJingle.clip) {
				overlapFrames = Number(props[1])
			}
		}
	})

	if (overlapFrames === -1) {
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
		autoNextOverlap: TimeFromFrames(overlapFrames)
	})

	const adLibPieces: IBlueprintAdLibPiece[] = []
	const pieces: IBlueprintPiece[] = []

	EvaluateCues(context, config, pieces, adLibPieces, partDefinition.cues, partDefinition)
	AddScript(partDefinition, pieces, partTime, false)

	if (pieces.length === 0) {
		return CreatePartInvalid(partDefinition)
	}

	return {
		part,
		adLibPieces,
		pieces
	}
}
