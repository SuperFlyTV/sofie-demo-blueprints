import { IBlueprintPiece, PartContext } from 'tv-automation-sofie-blueprints-integration'
import { BlueprintConfig } from '../../../tv2_afvd_studio/helpers/config'
import { CueTime, CueType, ParseCue, UnparsedCue } from '../../inewsConversion/converters/ParseCue'
import { EvaluateEkstern } from './ekstern'

const FRAME_TIME = 1000 / 25 // TODO: This should be pulled from config.

export function EvaluateCues(
	context: PartContext,
	config: BlueprintConfig,
	pieces: IBlueprintPiece[],
	cues: Array<UnparsedCue | null>,
	partId: string
) {
	cues.forEach(cue => {
		if (cue) {
			const parsedCue = ParseCue(cue)
			switch (parsedCue.type) {
				case CueType.Ekstern:
					EvaluateEkstern(context, config, pieces, partId, parsedCue)
					break
				default:
					if (parsedCue.type !== CueType.Unknown) {
						context.warning(`Unknown cue type: ${CueType[parsedCue.type]}`)
					}
					break
			}
		}
	})
}

export function CalculateTime(time: CueTime) {
	let result = 0
	if (time.seconds) {
		result += time.seconds * 1000
	}

	if (time.frames) {
		result += time.frames * FRAME_TIME
	}

	return result
}
