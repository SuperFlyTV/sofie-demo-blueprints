import {
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	PartContext,
	PieceLifespan
} from 'tv-automation-sofie-blueprints-integration'
import { BlueprintConfig } from '../../../tv2_afvd_showstyle/helpers/config'
import { PartDefinition } from '../../../tv2_afvd_showstyle/inewsConversion/converters/ParseBody'
import { CueDefinition, CueDefinitionBase, CueTime, CueType } from '../../inewsConversion/converters/ParseCue'
import { EvaluateAdLib } from './adlib'
import { EvaluateDVE } from './dve'
import { EvaluateEkstern } from './ekstern'
import { EvaluateGrafik } from './grafik'
import { EvaluateJingle } from './jingle'
import { EvaluateLYD } from './lyd'
import { EvaluateTelefon } from './telefon'
import { EvaluateVIZ } from './viz'

const FRAME_TIME = 1000 / 25 // TODO: This should be pulled from config.

export function EvaluateCues(
	context: PartContext,
	config: BlueprintConfig,
	pieces: IBlueprintPiece[],
	adLibPieces: IBlueprintAdLibPiece[],
	cues: CueDefinition[],
	part: PartDefinition
) {
	let adLibRank = 0
	const filteredCues = cues.filter(cue => cue.type !== CueType.Grafik)
	// const grafikCues = cues.filter(cue => cue.type === CueType.Grafik)
	// const isDVE = containsDVE(cues)
	filteredCues.forEach(cue => {
		if (cue) {
			switch (cue.type) {
				case CueType.Grafik:
					EvaluateGrafik(pieces, adLibPieces, part.externalId, cue, cue.adlib)
					break
				case CueType.MOS:
					// EvaluateMos(pieces, adLibPieces, part.externalId, cue, cue.adlib)
					break
				case CueType.Ekstern:
					EvaluateEkstern(context, config, pieces, part.externalId, cue)
					break
				case CueType.DVE:
					EvaluateDVE(context, config, pieces, part.externalId, cue)
					break
				case CueType.AdLib:
					EvaluateAdLib(context, config, adLibPieces, part.externalId, cue, part, adLibRank)
					adLibRank++
					break
				case CueType.Telefon:
					EvaluateTelefon(pieces, adLibPieces, part.externalId, cue)
					break
				case CueType.VIZ:
					EvaluateVIZ(context, config, pieces, adLibPieces, part.externalId, cue)
					break
				case CueType.Jingle:
					EvaluateJingle(config, pieces, cue, part)
					break
				case CueType.LYD:
					EvaluateLYD(pieces, cue, part)
					break
				default:
					if (cue.type !== CueType.Unknown) {
						context.warning(`Unimplemented cue type: ${CueType[cue.type]}`)
					}
					break
			}
		}
	})

	/*if (isDVE) {
		// All cues are AdLibs
		grafikCues.forEach((cue, i) => {
			EvaluateGrafik(pieces, adLibPieces, part.externalId, cue as any, true, i)
		})
	} else {
		// First cue is not AdLib, but also an AdLib
		grafikCues.forEach((cue, i) => {
			if (i === 0) {
				EvaluateGrafik(pieces, adLibPieces, part.externalId, cue as any)
			}
			EvaluateGrafik(pieces, adLibPieces, part.externalId, cue as any, true)
		})
	}*/
}

export function CreateTiming(
	cue: CueDefinition
): Pick<IBlueprintPiece, 'enable' | 'infiniteMode'> | Pick<IBlueprintAdLibPiece, 'infiniteMode' | 'expectedDuration'> {
	if (cue.adlib) {
		return CreateTimingAdLib(cue)
	} else {
		return CreateTimingEnable(cue)
	}
}

export function CreateTimingEnable(cue: CueDefinition) {
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
			result.infiniteMode = infiniteMode(cue.end.infiniteMode, PieceLifespan.Normal)
		} else {
			;(result.enable as any).end = CalculateTime(cue.end)
		}
	} else {
		result.infiniteMode = PieceLifespan.OutOnNextPart
	}

	return result
}

export function CreateTimingAdLib(
	cue: CueDefinitionBase
): Pick<IBlueprintAdLibPiece, 'infiniteMode' | 'expectedDuration'> {
	const result: Pick<IBlueprintAdLibPiece, 'infiniteMode' | 'expectedDuration'> = {
		infiniteMode: PieceLifespan.OutOnNextPart,
		expectedDuration: 0
	}

	if (cue.end) {
		if (cue.end.infiniteMode) {
			result.infiniteMode = infiniteMode(cue.end.infiniteMode, PieceLifespan.OutOnNextPart)
		} else {
			result.expectedDuration = CalculateTime(cue.end)
		}
	}

	return result
}

function infiniteMode(mode: 'B' | 'S' | 'O', defaultLifespan: PieceLifespan): PieceLifespan {
	switch (mode) {
		case 'B':
			return PieceLifespan.OutOnNextPart
		case 'S':
			return PieceLifespan.OutOnNextSegment
		case 'O':
			return PieceLifespan.Infinite
	}

	return defaultLifespan
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

/*function containsDVE(cues: CueDefinition[]) {
	return !!cues.filter(cue => cue.type === CueType.DVE).length
}*/
