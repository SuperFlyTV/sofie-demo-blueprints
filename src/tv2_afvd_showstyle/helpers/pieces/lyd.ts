import {
	DeviceType,
	TimelineContentTypeCasparCg,
	TimelineContentTypeSisyfos,
	TimelineObjCCGMedia,
	TimelineObjSisyfosMessage
} from 'timeline-state-resolver-types'
import {
	BaseContent,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	TimelineObjectCoreExt
} from 'tv-automation-sofie-blueprints-integration'
import { literal } from '../../../common/util'
import { PartDefinition } from '../../../tv2_afvd_showstyle/inewsConversion/converters/ParseBody'
import { CueDefinitionLYD } from '../../../tv2_afvd_showstyle/inewsConversion/converters/ParseCue'
import { SourceLayer } from '../../../tv2_afvd_showstyle/layers'
import { CasparLLayer, SisyfosLLAyer } from '../../../tv2_afvd_studio/layers'
import { CalculateTime, CreateTimingEnable } from './evaluateCues'

export function EvaluateLYD(
	pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
	parsedCue: CueDefinitionLYD,
	part: PartDefinition,
	adlib?: boolean,
	rank?: number
) {
	if (adlib) {
		adlibPieces.push(
			literal<IBlueprintAdLibPiece>({
				_rank: rank || 0,
				externalId: part.externalId,
				name: parsedCue.variant,
				outputLayerId: 'pgm0',
				sourceLayerId: SourceLayer.PgmAudioBed,
				content: literal<BaseContent>({
					timelineObjects: literal<TimelineObjectCoreExt[]>([
						literal<TimelineObjCCGMedia>({
							id: '',
							enable: {
								start: parsedCue.start ? CalculateTime(parsedCue.start) : 0,
								...(parsedCue.end ? { end: CalculateTime(parsedCue.end) } : {})
							},
							priority: 1,
							layer: CasparLLayer.CasparCGLYD,
							content: {
								deviceType: DeviceType.CASPARCG,
								type: TimelineContentTypeCasparCg.MEDIA,
								file: parsedCue.variant
							}
						}),
						literal<TimelineObjSisyfosMessage>({
							id: '',
							enable: {
								start: parsedCue.start ? CalculateTime(parsedCue.start) : 0,
								...(parsedCue.end ? { end: CalculateTime(parsedCue.end) } : {})
							},
							priority: 1,
							layer: SisyfosLLAyer.SisyfosSourceAudio,
							content: {
								deviceType: DeviceType.SISYFOS,
								type: TimelineContentTypeSisyfos.SISYFOS,
								isPgm: 1
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
				externalId: part.externalId,
				name: parsedCue.variant,
				...CreateTimingEnable(parsedCue),
				outputLayerId: 'pgm0',
				sourceLayerId: SourceLayer.PgmAudioBed,
				content: literal<BaseContent>({
					timelineObjects: literal<TimelineObjectCoreExt[]>([
						literal<TimelineObjCCGMedia>({
							id: '',
							enable: {
								start: parsedCue.start ? CalculateTime(parsedCue.start) : 0,
								...(parsedCue.end ? { end: CalculateTime(parsedCue.end) } : {})
							},
							priority: 1,
							layer: CasparLLayer.CasparCGLYD,
							content: {
								deviceType: DeviceType.CASPARCG,
								type: TimelineContentTypeCasparCg.MEDIA,
								file: parsedCue.variant
							}
						}),
						literal<TimelineObjSisyfosMessage>({
							id: '',
							enable: {
								start: parsedCue.start ? CalculateTime(parsedCue.start) : 0,
								...(parsedCue.end ? { end: CalculateTime(parsedCue.end) } : {})
							},
							priority: 1,
							layer: SisyfosLLAyer.SisyfosSourceAudio,
							content: {
								deviceType: DeviceType.SISYFOS,
								type: TimelineContentTypeSisyfos.SISYFOS,
								isPgm: 1
							}
						})
					])
				})
			})
		)
	}
}
