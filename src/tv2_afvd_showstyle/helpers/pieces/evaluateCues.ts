import {
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	PartContext,
	PieceLifespan
} from 'tv-automation-sofie-blueprints-integration'
import { BlueprintConfig } from '../../../tv2_afvd_showstyle/helpers/config'
import { PartDefinition } from '../../../tv2_afvd_showstyle/inewsConversion/converters/ParseBody'
import {
	CueDefinition,
	CueDefinitionBase,
	CueTime,
	CueType,
	ParseCue,
	UnparsedCue
} from '../../inewsConversion/converters/ParseCue'
import { EvaluateAdLib } from './adlib'
import { EvaluateDVE } from './dve'
import { EvaluateEkstern } from './ekstern'
import { EvaluateGrafik } from './grafik'
import { EvaluateJingle } from './jingle'
import { EvaluateTelefon } from './telefon'
import { EvaluateVIZ } from './viz'

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
	filteredCues.forEach(parsedCue => {
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
				case CueType.VIZ:
					EvaluateVIZ(context, config, pieces, adLibPieces, part.externalId, parsedCue)
					break
				case CueType.Jingle:
					EvaluateJingle(pieces, parsedCue, part)
					break
				default:
					if (parsedCue.type !== CueType.Unknown) {
						context.warning(`Unknown cue type: ${CueType[parsedCue.type]}`)
					}
					break
			}
		}
	})

	if (isDVE) {
		// All cues are AdLibs
		grafikCues.forEach((parsedCue, i) => {
			EvaluateGrafik(context, config, pieces, adLibPieces, part.externalId, parsedCue as any, true, i)
		})
	} else {
		// First cue is not AdLib, but also an AdLib
		grafikCues.forEach((parsedCue, i) => {
			if (i === 0) {
				EvaluateGrafik(context, config, pieces, adLibPieces, part.externalId, parsedCue as any)
			}
			EvaluateGrafik(context, config, pieces, adLibPieces, part.externalId, parsedCue as any, true)
		})
	}
}

export function CreateTiming(cue: CueDefinitionBase): Pick<IBlueprintPiece, 'enable' | 'infiniteMode'> {
	const result: Pick<IBlueprintPiece, 'enable' | 'infiniteMode'> = {
		enable: {},
		infiniteMode: PieceLifespan.Normal
	}
	if (cue.start) {
		;(result.enable as any).start = CalculateTime(cue.start)
	} else {
		;(result.enable as any).start = 0
	}

	if (cue.end) {
		if (cue.end.infiniteMode) {
			switch (cue.end.infiniteMode) {
				case 'B':
					result.infiniteMode = PieceLifespan.OutOnNextPart
					break
				case 'S':
					result.infiniteMode = PieceLifespan.OutOnNextSegment
					break
				case 'O':
					result.infiniteMode = PieceLifespan.Infinite
					break
			}
		} else {
			;(result.enable as any).end = CalculateTime(cue.end)
		}
	} else {
		result.infiniteMode = PieceLifespan.Normal
	}

	return result
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
