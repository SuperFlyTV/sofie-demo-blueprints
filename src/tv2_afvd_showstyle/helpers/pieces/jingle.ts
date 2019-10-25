import {
	DeviceType,
	TimelineContentTypeAtem,
	TimelineContentTypeCasparCg,
	TimelineContentTypeSisyfos,
	TimelineObjAtemDSK,
	TimelineObjCCGMedia,
	TimelineObjSisyfosAny
} from 'timeline-state-resolver-types'
import {
	IBlueprintPiece,
	PieceLifespan,
	TimelineObjectCoreExt,
	VTContent
} from 'tv-automation-sofie-blueprints-integration'
import { literal } from '../../../common/util'
import { PartDefinition } from '../../../tv2_afvd_showstyle/inewsConversion/converters/ParseBody'
import { CueDefinitionJingle } from '../../../tv2_afvd_showstyle/inewsConversion/converters/ParseCue'
import { SourceLayer } from '../../../tv2_afvd_showstyle/layers'
import { AtemLLayer, CasparLLayer, SisyfosLLAyer } from '../../../tv2_afvd_studio/layers'
import { TimelineBlueprintExt } from '../../../tv2_afvd_studio/onTimelineGenerate'

export function EvaluateJingle(pieces: IBlueprintPiece[], parsedCue: CueDefinitionJingle, part: PartDefinition) {
	const duration = Number(part.fields.tapeTime) * 1000 || 0
	pieces.push(
		literal<IBlueprintPiece>({
			_id: '',
			externalId: part.externalId,
			name: parsedCue.clip,
			enable: {
				start: 0
			},
			infiniteMode: PieceLifespan.OutOnNextPart,
			outputLayerId: 'pgm0',
			sourceLayerId: SourceLayer.PgmJingle,
			content: literal<VTContent>({
				studioLabel: '',
				fileName: parsedCue.clip,
				path: parsedCue.clip,
				firstWords: '',
				lastWords: '',
				sourceDuration: duration,
				timelineObjects: literal<TimelineObjectCoreExt[]>([
					literal<TimelineObjCCGMedia & TimelineBlueprintExt>({
						id: '',
						enable: {
							start: 0
						},
						priority: 1,
						layer: CasparLLayer.CasparPlayerJingle,
						content: {
							deviceType: DeviceType.CASPARCG,
							type: TimelineContentTypeCasparCg.MEDIA,
							file: parsedCue.clip,
							length: duration
						}
					}),

					literal<TimelineObjAtemDSK & TimelineBlueprintExt>({
						id: '',
						enable: {
							start: 0
						},
						priority: 1,
						layer: AtemLLayer.AtemMEProgram,
						content: {
							deviceType: DeviceType.ATEM,
							type: TimelineContentTypeAtem.DSK,
							dsk: {
								onAir: true,
								sources: {
									fillSource: 29,
									cutSource: 31
								}
							}
						}
					}),

					literal<TimelineObjSisyfosAny & TimelineBlueprintExt>({
						id: '',
						enable: {
							start: 0
						},
						priority: 1,
						layer: SisyfosLLAyer.SisyfosSourceJingle,
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
}
