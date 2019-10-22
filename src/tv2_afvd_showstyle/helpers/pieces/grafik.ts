import { IBlueprintPiece, PartContext, PieceLifespan } from 'tv-automation-sofie-blueprints-integration'
import { literal } from '../../../common/util'
import { CueDefinitionGrafik } from '../../../tv2_afvd_showstyle/inewsConversion/converters/ParseCue'
import { SourceLayer } from '../../../tv2_afvd_showstyle/layers'
import { BlueprintConfig } from '../../../tv2_afvd_studio/helpers/config'

/**
 * @returns {true} If a cue is a grafik
 */
export function IsGrafik(rawString: string): boolean {
	return !!rawString.match(/^(?:kg |DIGI=)/)
}

export function EvaluateGrafik(
	_context: PartContext,
	_config: BlueprintConfig,
	pieces: IBlueprintPiece[],
	partId: string,
	parsedCue: CueDefinitionGrafik
) {
	pieces.push(
		literal<IBlueprintPiece>({
			_id: '',
			externalId: partId,
			name: parsedCue.template || 'Grafik',
			enable: { start: 0 },
			outputLayerId: 'pgm0',
			sourceLayerId: SourceLayer.PgmGraphics,
			infiniteMode: PieceLifespan.OutOnNextPart
		})
	) // TODO: Timeline objects
}
