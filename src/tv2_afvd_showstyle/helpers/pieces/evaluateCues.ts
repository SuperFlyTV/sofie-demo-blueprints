import { IBlueprintAdLibPiece, IBlueprintPiece, PartContext } from 'tv-automation-sofie-blueprints-integration'
import { BlueprintConfig } from '../../../tv2_afvd_showstyle/helpers/config'
import { PartDefinition } from '../../../tv2_afvd_showstyle/inewsConversion/converters/ParseBody'
import { CueTime, CueType, ParseCue, UnparsedCue } from '../../inewsConversion/converters/ParseCue'
import { EvaluateAdLib } from './adlib'
import { EvaluateDVE } from './dve'
import { EvaluateEkstern } from './ekstern'
import { EvaluateGrafik } from './grafik'
import { EvaluateTelefon } from './telefon'

const FRAME_TIME = 1000 / 25 // TODO: This should be pulled from config.

export function EvaluateCues(
	context: PartContext,
	config: BlueprintConfig,
	pieces: IBlueprintPiece[],
	adLibPieces: IBlueprintAdLibPiece[],
	cues: Array<UnparsedCue | null>,
	part: PartDefinition
) {
	let adLibRank = 0
	cues.forEach(cue => {
		if (cue) {
			const parsedCue = ParseCue(cue)
			switch (parsedCue.type) {
				case CueType.Ekstern:
					EvaluateEkstern(context, config, pieces, part.externalId, parsedCue)
					break
				case CueType.DVE:
					EvaluateDVE(context, config, pieces, part.externalId, parsedCue)
					break
				case CueType.AdLib:
					EvaluateAdLib(context, config, adLibPieces, part.externalId, parsedCue, part, adLibRank)
					adLibRank++
					break
				case CueType.Telefon:
					EvaluateTelefon(context, config, pieces, part.externalId, parsedCue)
					break
				case CueType.Grafik:
					EvaluateGrafik(context, config, pieces, part.externalId, parsedCue)
					break
				default:
					if (parsedCue.type === CueType.Unknown) {
						context.warning(`Unknown cue: ${cue}`)
					} else {
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
