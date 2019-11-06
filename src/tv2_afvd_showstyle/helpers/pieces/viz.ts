import {
	DeviceType,
	TimelineContentTypeCasparCg,
	TimelineObjCCGMedia,
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
import { CasparLLayer } from '../../../tv2_afvd_studio/layers'
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
	switch (parsedCue.design) {
		case 'dve-triopage':
			const path = parsedCue.content.triopage ? parsedCue.content.triopage : parsedCue.content.GRAFIK
			pieces.push(
				literal<IBlueprintPiece>({
					_id: '',
					externalId: partId,
					name: path,
					enable: {
						start: 0
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
			break
		default:
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
			break
	}
}
