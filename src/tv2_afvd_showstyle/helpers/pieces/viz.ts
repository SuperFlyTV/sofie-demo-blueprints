import {
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	PartContext,
	PieceLifespan
} from 'tv-automation-sofie-blueprints-integration'
import { literal } from '../../../common/util'
import { CueDefinitionVIZ } from '../../../tv2_afvd_showstyle/inewsConversion/converters/ParseCue'
import { SourceLayer } from '../../../tv2_afvd_showstyle/layers'
import { BlueprintConfig } from '../../../tv2_afvd_studio/helpers/config'
import { CalculateTime } from './evaluateCues'

export function EvaluateVIZ(
	_context: PartContext,
	_config: BlueprintConfig,
	pieces: IBlueprintPiece[],
	_adlibPieces: IBlueprintAdLibPiece[],
	partId: string,
	parsedCue: CueDefinitionVIZ
) {
	// TODO: Viz timeline objects
	pieces.push(
		literal<IBlueprintPiece>({
			_id: '',
			externalId: partId,
			name: parsedCue.rawType,
			enable: {
				start: parsedCue.start ? CalculateTime(parsedCue.start) : 0,
				...(parsedCue.end ? { end: CalculateTime(parsedCue.end) } : {})
			},
			outputLayerId: 'pgm0',
			sourceLayerId: SourceLayer.PgmVIZ,
			infiniteMode: PieceLifespan.OutOnNextPart
		})
	)
}
