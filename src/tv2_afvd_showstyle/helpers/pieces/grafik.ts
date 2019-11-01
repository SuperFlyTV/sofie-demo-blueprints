import {
	DeviceType,
	TimelineContentTypeVizMSE,
	TimelineObjVIZMSEAny,
	TimelineObjVIZMSEElementInternal
} from 'timeline-state-resolver-types'
import {
	GraphicsContent,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	PartContext,
	PieceLifespan
} from 'tv-automation-sofie-blueprints-integration'
import { literal } from '../../../common/util'
import { CueDefinitionGrafik } from '../../../tv2_afvd_showstyle/inewsConversion/converters/ParseCue'
import { SourceLayer } from '../../../tv2_afvd_showstyle/layers'
import { BlueprintConfig } from '../../../tv2_afvd_studio/helpers/config'
import { VizLLayer } from '../../../tv2_afvd_studio/layers'
import { CalculateTime, CreateTiming } from './evaluateCues'

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
	adlibPieces: IBlueprintAdLibPiece[],
	partId: string,
	parsedCue: CueDefinitionGrafik,
	adlib?: boolean,
	rank?: number
) {
	if (adlib) {
		adlibPieces.push(
			literal<IBlueprintAdLibPiece>({
				_rank: rank || 0,
				externalId: partId,
				name: grafikName(parsedCue),
				sourceLayerId: SourceLayer.PgmGraphics,
				outputLayerId: 'pgm0',
				expectedDuration: 0,
				infiniteMode: PieceLifespan.OutOnNextPart
			})
		)
	} else {
		pieces.push(
			literal<IBlueprintPiece>({
				_id: '',
				externalId: partId,
				name: grafikName(parsedCue),
				...CreateTiming(parsedCue),
				outputLayerId: 'pgm0',
				sourceLayerId: SourceLayer.PgmGraphics,
				content: literal<GraphicsContent>({
					fileName: parsedCue.template,
					path: parsedCue.template,
					timelineObjects: literal<TimelineObjVIZMSEAny[]>([
						literal<TimelineObjVIZMSEElementInternal>({
							id: '',
							enable: {
								start: parsedCue.start ? CalculateTime(parsedCue.start) : 0,
								...(parsedCue.end ? { end: CalculateTime(parsedCue.end) } : {})
							},
							priority: 1,
							layer: VizLLayer.VizLLayerOverlay,
							content: {
								deviceType: DeviceType.VIZMSE,
								type: TimelineContentTypeVizMSE.ELEMENT_INTERNAL,
								templateName: parsedCue.template,
								templateData: parsedCue.textFields
							}
						})
					])
				})
			})
		)
	}
}

function grafikName(parsedCue: CueDefinitionGrafik) {
	return `${parsedCue.template ? `${parsedCue.template}` : ''}${parsedCue.textFields
		.filter(txt => !txt.match(/^;.\.../))
		.map(txt => ` - ${txt}`)}`.replace(/,/g, '')
}
