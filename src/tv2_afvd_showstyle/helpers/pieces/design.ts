import {
	DeviceType,
	TimelineContentTypeVizMSE,
	TimelineObjVIZMSEElementInternal,
	TSRTimelineObj
} from 'timeline-state-resolver-types'
import {
	GraphicsContent,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	PieceLifespan
} from 'tv-automation-sofie-blueprints-integration'
import * as _ from 'underscore'
import { literal } from '../../../common/util'
import { CueDefinitionDesign } from '../../../tv2_afvd_showstyle/inewsConversion/converters/ParseCue'
import { SourceLayer } from '../../../tv2_afvd_showstyle/layers'
import { BlueprintConfig } from '../../../tv2_afvd_studio/helpers/config'
import { VizLLayer } from '../../../tv2_afvd_studio/layers'
import { CalculateTime } from './evaluateCues'

export function EvaluateDesign(
	_config: BlueprintConfig,
	pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
	partId: string,
	parsedCue: CueDefinitionDesign,
	adlib?: boolean,
	rank?: number
) {
	if (adlib) {
		adlibPieces.push(
			literal<IBlueprintAdLibPiece>({
				_rank: rank || 0,
				externalId: partId,
				name: parsedCue.design,
				outputLayerId: 'pgm0',
				sourceLayerId: SourceLayer.PgmDesign,
				infiniteMode: PieceLifespan.Infinite,
				content: literal<GraphicsContent>({
					fileName: parsedCue.design,
					path: parsedCue.design,
					timelineObjects: _.compact<TSRTimelineObj>([
						literal<TimelineObjVIZMSEElementInternal>({
							id: '',
							enable: { start: 0 },
							priority: 100,
							layer: VizLLayer.VizLLayerDesign,
							content: {
								deviceType: DeviceType.VIZMSE,
								type: TimelineContentTypeVizMSE.ELEMENT_INTERNAL,
								templateName: parsedCue.design,
								templateData: []
							}
						})
					])
				})
			})
		)
	} else {
		pieces.push(
			literal<IBlueprintPiece>({
				_id: '',
				externalId: partId,
				name: parsedCue.design,
				enable: {
					start: parsedCue.start ? CalculateTime(parsedCue.start) : 0
				},
				outputLayerId: 'pgm0',
				sourceLayerId: SourceLayer.PgmDesign,
				infiniteMode: PieceLifespan.Infinite,
				content: literal<GraphicsContent>({
					fileName: parsedCue.design,
					path: parsedCue.design,
					timelineObjects: _.compact<TSRTimelineObj>([
						literal<TimelineObjVIZMSEElementInternal>({
							id: '',
							enable: { start: 0 },
							priority: 100,
							layer: VizLLayer.VizLLayerDesign,
							content: {
								deviceType: DeviceType.VIZMSE,
								type: TimelineContentTypeVizMSE.ELEMENT_INTERNAL,
								templateName: parsedCue.design,
								templateData: []
							}
						})
					])
				})
			})
		)
	}
}
