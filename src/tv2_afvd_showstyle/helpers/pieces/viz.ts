import {
	DeviceType,
	TimelineContentTypeCasparCg,
	TimelineContentTypeVizMSE,
	TimelineObjCCGMedia,
	TimelineObjVIZMSEElementInternal,
	TSRTimelineObj
} from 'timeline-state-resolver-types'
import {
	GraphicsContent,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	PartContext,
	PieceLifespan
} from 'tv-automation-sofie-blueprints-integration'
import * as _ from 'underscore'
import { literal } from '../../../common/util'
import { CueDefinitionVIZ } from '../../../tv2_afvd_showstyle/inewsConversion/converters/ParseCue'
import { SourceLayer } from '../../../tv2_afvd_showstyle/layers'
import { BlueprintConfig } from '../../../tv2_afvd_studio/helpers/config'
import { CasparLLayer, VizLLayer } from '../../../tv2_afvd_studio/layers'
import { CalculateTime } from './evaluateCues'

export function EvaluateVIZ(
	context: PartContext,
	_config: BlueprintConfig,
	pieces: IBlueprintPiece[],
	_adlibPieces: IBlueprintAdLibPiece[],
	partId: string,
	parsedCue: CueDefinitionVIZ
) {
	if (parsedCue.design.match(/^dve-triopage$/)) {
		const path = parsedCue.content.triopage ? parsedCue.content.triopage : parsedCue.content.GRAFIK
		pieces.push(
			literal<IBlueprintPiece>({
				_id: '',
				externalId: partId,
				name: path,
				enable: {
					start: parsedCue.start ? CalculateTime(parsedCue.start) : 0
				},
				outputLayerId: 'pgm0',
				sourceLayerId: SourceLayer.PgmDVEBackground,
				infiniteMode: PieceLifespan.Infinite,
				content: literal<GraphicsContent>({
					fileName: path,
					path,
					timelineObjects: _.compact<TSRTimelineObj>([
						literal<TimelineObjCCGMedia>({
							id: '',
							enable: { start: 0 },
							priority: 100,
							layer: CasparLLayer.CasparCGDVELoop,
							content: {
								deviceType: DeviceType.CASPARCG,
								type: TimelineContentTypeCasparCg.MEDIA,
								file: path,
								loop: true
							}
						})
					])
				})
			})
		)
	} else if (parsedCue.rawType.match(/^VIZ=grafik-design$/)) {
		context.warning('VIZ=grafik-design is not supported for this showstyle')
	} else {
		const path = parsedCue.content.triopage ? parsedCue.content.triopage : parsedCue.content.GRAFIK
		pieces.push(
			literal<IBlueprintPiece>({
				_id: '',
				externalId: partId,
				name: path,
				enable: {
					start: parsedCue.start ? CalculateTime(parsedCue.start) : 0
				},
				outputLayerId: 'pgm0',
				sourceLayerId: SourceLayer.PgmDesign,
				infiniteMode: PieceLifespan.Infinite,
				content: literal<GraphicsContent>({
					fileName: path,
					path,
					timelineObjects: _.compact<TSRTimelineObj>([
						literal<TimelineObjVIZMSEElementInternal>({
							id: '',
							enable: { start: 0 },
							priority: 100,
							layer: VizLLayer.VizLLayerDesign,
							content: {
								deviceType: DeviceType.VIZMSE,
								type: TimelineContentTypeVizMSE.ELEMENT_INTERNAL,
								templateName: path,
								templateData: []
							}
						})
					])
				})
			})
		)
	}
}
