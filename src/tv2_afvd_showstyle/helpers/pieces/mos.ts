import {
	DeviceType,
	TimelineContentTypeVizMSE,
	TimelineObjVIZMSEAny,
	TimelineObjVIZMSEElementPilot
} from 'timeline-state-resolver-types'
import {
	GraphicsContent,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	PieceLifespan
} from 'tv-automation-sofie-blueprints-integration'
import { literal } from '../../../common/util'
import { CueDefinitionMOS } from '../../../tv2_afvd_showstyle/inewsConversion/converters/ParseCue'
import { SourceLayer } from '../../../tv2_afvd_showstyle/layers'
import { VizLLayer } from '../../../tv2_afvd_studio/layers'
import { CalculateTime, CreateTimingAdLib, CreateTimingEnable } from './evaluateCues'
import { grafikName } from './grafik'

export function EvaluateMOS(
	pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
	partId: string,
	parsedCue: CueDefinitionMOS,
	adlib?: boolean,
	rank?: number
) {
	if (adlib) {
		adlibPieces.push(
			literal<IBlueprintAdLibPiece>({
				_rank: rank || 0,
				externalId: partId,
				name: grafikName(parsedCue),
				...CreateTimingAdLib(parsedCue),
				sourceLayerId: SourceLayer.PgmGraphics,
				outputLayerId: 'pgm0',
				expectedDuration: 0,
				infiniteMode: PieceLifespan.OutOnNextPart,
				content: literal<GraphicsContent>({
					fileName: parsedCue.name,
					path: parsedCue.vcpid.toString(),
					timelineObjects: literal<TimelineObjVIZMSEAny[]>([
						literal<TimelineObjVIZMSEElementPilot>({
							id: '',
							enable: {
								start: parsedCue.start ? CalculateTime(parsedCue.start) : 0,
								...(parsedCue.end ? { end: CalculateTime(parsedCue.end) } : {})
							},
							priority: 1,
							layer: VizLLayer.VizLLayerOverlay,
							content: {
								deviceType: DeviceType.VIZMSE,
								type: TimelineContentTypeVizMSE.ELEMENT_PILOT,
								templateVcpId: parsedCue.vcpid,
								continueStep: parsedCue.continueCount
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
				name: grafikName(parsedCue),
				...CreateTimingEnable(parsedCue),
				outputLayerId: 'pgm0',
				sourceLayerId: SourceLayer.PgmGraphics,
				content: literal<GraphicsContent>({
					fileName: parsedCue.name,
					path: parsedCue.vcpid.toString(),
					timelineObjects: literal<TimelineObjVIZMSEAny[]>([
						literal<TimelineObjVIZMSEElementPilot>({
							id: '',
							enable: {
								start: parsedCue.start ? CalculateTime(parsedCue.start) : 0,
								...(parsedCue.end ? { end: CalculateTime(parsedCue.end) } : {})
							},
							priority: 1,
							layer: VizLLayer.VizLLayerOverlay,
							content: {
								deviceType: DeviceType.VIZMSE,
								type: TimelineContentTypeVizMSE.ELEMENT_PILOT,
								templateVcpId: parsedCue.vcpid,
								continueStep: parsedCue.continueCount
							}
						})
					])
				})
			})
		)
	}
}
