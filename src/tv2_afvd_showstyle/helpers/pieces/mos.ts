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
import { BlueprintConfig } from '../config'
import { InfiniteMode } from './evaluateCues'
import { CreateTimingGrafik, GetGrafikDuration, grafikName } from './grafik'

export function EvaluateMOS(
	config: BlueprintConfig,
	pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
	partId: string,
	parsedCue: CueDefinitionMOS,
	adlib?: boolean,
	isTlf?: boolean,
	rank?: number
) {
	if (adlib) {
		adlibPieces.push(
			literal<IBlueprintAdLibPiece>({
				_rank: rank || 0,
				externalId: partId,
				name: grafikName(parsedCue),
				expectedDuration: GetGrafikDuration(config, parsedCue),
				infiniteMode:
					parsedCue.end && parsedCue.end.infiniteMode
						? InfiniteMode(parsedCue.end.infiniteMode, PieceLifespan.Normal)
						: PieceLifespan.Normal,
				sourceLayerId: isTlf ? SourceLayer.PgmGraphicsTLF : SourceLayer.PgmPilot,
				outputLayerId: 'pgm0',
				content: literal<GraphicsContent>({
					fileName: parsedCue.name,
					path: parsedCue.vcpid.toString(),
					timelineObjects: literal<TimelineObjVIZMSEAny[]>([
						literal<TimelineObjVIZMSEElementPilot>({
							id: '',
							enable: {
								start: 0
							},
							priority: 1,
							layer: VizLLayer.VizLLayerOverlay,
							content: {
								deviceType: DeviceType.VIZMSE,
								type: TimelineContentTypeVizMSE.ELEMENT_PILOT,
								templateVcpId: parsedCue.vcpid,
								continueStep: parsedCue.continueCount,
								noAutoPreloading: true,
								channelName: 'FULL1'
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
				enable: {
					...CreateTimingGrafik(config, parsedCue)
				},
				outputLayerId: 'pgm0',
				sourceLayerId: isTlf ? SourceLayer.PgmGraphicsTLF : SourceLayer.PgmPilot,
				infiniteMode:
					parsedCue.end && parsedCue.end.infiniteMode
						? InfiniteMode(parsedCue.end.infiniteMode, PieceLifespan.Normal)
						: PieceLifespan.Normal,
				content: literal<GraphicsContent>({
					fileName: parsedCue.name,
					path: parsedCue.vcpid.toString(),
					timelineObjects: literal<TimelineObjVIZMSEAny[]>([
						literal<TimelineObjVIZMSEElementPilot>({
							id: '',
							enable: {
								start: 0
							},
							priority: 1,
							layer: VizLLayer.VizLLayerOverlay,
							content: {
								deviceType: DeviceType.VIZMSE,
								type: TimelineContentTypeVizMSE.ELEMENT_PILOT,
								templateVcpId: parsedCue.vcpid,
								continueStep: parsedCue.continueCount,
								noAutoPreloading: true,
								channelName: 'FULL1'
							}
						})
					])
				})
			})
		)
	}
}
