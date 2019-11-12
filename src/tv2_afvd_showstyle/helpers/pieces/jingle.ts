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
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	PartContext,
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
import { BlueprintConfig } from '../config'

export function EvaluateJingle(
	context: PartContext,
	config: BlueprintConfig,
	pieces: IBlueprintPiece[],
	_adlibPieces: IBlueprintAdLibPiece[],
	parsedCue: CueDefinitionJingle,
	part: PartDefinition,
	adlib?: boolean,
	_rank?: number
) {
	const duration = Number(part.fields.tapeTime) * 1000 || 0

	if (!config.showStyle.JingleTimings) {
		context.warning(`Jingles have not been configured`)
		return
	}

	const jingle = config.showStyle.JingleTimings.find(jngl => jngl.JingleName === parsedCue.clip)
	if (!jingle) {
		context.warning(`Jingle ${parsedCue.clip} is not configured`)
		return
	}

	if (adlib) {
		context.warning(`Jingles should never be adlibs`)
	} else {
		pieces.push(
			literal<IBlueprintPiece>({
				_id: '',
				externalId: part.externalId,
				name: parsedCue.clip,
				enable: {
					start: 0,
					duration
				},
				infiniteMode: PieceLifespan.OutOnNextPart,
				outputLayerId: 'pgm0',
				sourceLayerId: SourceLayer.PgmJingle,
				isTransition: true,
				content: literal<VTContent>({
					studioLabel: '',
					fileName: jingle.FileName.toString(),
					path: jingle.FileName.toString(),
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
								file: jingle.FileName.toString(),
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
										fillSource: config.studio.AtemSource.JingleFill,
										cutSource: config.studio.AtemSource.JingleKey
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
}
