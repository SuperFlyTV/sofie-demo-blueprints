import { DeviceType, TimelineContentTypeSisyfos, TimelineObjSisyfosMessage } from 'timeline-state-resolver-types'
import {
	BaseContent,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	PartContext,
	TimelineObjectCoreExt
} from 'tv-automation-sofie-blueprints-integration'
import { literal } from '../../../common/util'
import { CueDefinitionTelefon } from '../../../tv2_afvd_showstyle/inewsConversion/converters/ParseCue'
import { SourceLayer } from '../../../tv2_afvd_showstyle/layers'
import { BlueprintConfig } from '../../../tv2_afvd_studio/helpers/config'
import { SisyfosSourceTelefon } from '../../../tv2_afvd_studio/layers'
import { CreateTiming } from './evaluateCues'
import { EvaluateGrafik } from './grafik'

export function EvaluateTelefon(
	_context: PartContext,
	_config: BlueprintConfig,
	pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
	partId: string,
	parsedCue: CueDefinitionTelefon
) {
	// TODO: Grafik
	pieces.push(
		literal<IBlueprintPiece>({
			_id: '',
			externalId: partId,
			name: parsedCue.source,
			...CreateTiming(parsedCue),
			outputLayerId: 'pgm0',
			sourceLayerId: SourceLayer.PgmTelephone,
			content: literal<BaseContent>({
				timelineObjects: literal<TimelineObjectCoreExt[]>([
					literal<TimelineObjSisyfosMessage>({
						id: '',
						enable: {
							start: 0
						},
						priority: 1,
						layer: SisyfosSourceTelefon(parsedCue.source),
						content: {
							deviceType: DeviceType.SISYFOS,
							type: TimelineContentTypeSisyfos.SISYFOS,
							isPgm: 1,
							faderLevel: 0.75
						}
					})
				])
			})
		})
	)

	if (parsedCue.vizObj) {
		EvaluateGrafik(_context, _config, pieces, adlibPieces, partId, parsedCue.vizObj)
	}
}
