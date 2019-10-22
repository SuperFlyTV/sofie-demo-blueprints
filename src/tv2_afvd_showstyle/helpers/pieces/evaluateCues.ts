import { IBlueprintAdLibPiece, IBlueprintPiece, PartContext } from 'tv-automation-sofie-blueprints-integration'
import { BlueprintConfig } from '../../../tv2_afvd_showstyle/helpers/config'
import { PartDefinition } from '../../../tv2_afvd_showstyle/inewsConversion/converters/ParseBody'
import { CueDefinition, CueTime, CueType, ParseCue, UnparsedCue } from '../../inewsConversion/converters/ParseCue'
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
	const parsedCues = cues.map(cue => ParseCue(cue))
	const filteredCues = parsedCues.filter(cue => cue.type !== CueType.Grafik)
	const grafikCues = parsedCues.filter(cue => cue.type === CueType.Grafik)
	const isDVE = containsDVE(parsedCues)
	;(isDVE ? filteredCues : parsedCues).forEach(parsedCue => {
		if (parsedCue) {
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
					EvaluateTelefon(context, config, pieces, adLibPieces, part.externalId, parsedCue)
					break
				case CueType.Grafik:
					EvaluateGrafik(context, config, pieces, adLibPieces, part.externalId, parsedCue)
					break
				default:
					if (parsedCue.type === CueType.Unknown) {
						context.warning(`Unknown cue: ${JSON.stringify(parsedCue)}`)
					} else {
						context.warning(`Unknown cue type: ${CueType[parsedCue.type]}`)
					}
					break
			}
		}
	})

	if (isDVE) {
		grafikCues.forEach(parsedCue => {
			EvaluateGrafik(context, config, pieces, adLibPieces, part.externalId, parsedCue as any, true)
		})
	}
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

function containsDVE(cues: CueDefinition[]) {
	return !!cues.filter(cue => cue.type === CueType.DVE).length
}
