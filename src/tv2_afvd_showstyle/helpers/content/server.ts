import {
	AtemTransitionStyle,
	DeviceType,
	TimelineContentTypeAtem,
	TimelineContentTypeCasparCg,
	TimelineContentTypeSisyfos,
	TimelineObjAtemME,
	TimelineObjCCGMedia,
	TimelineObjSisyfosAny
} from 'timeline-state-resolver-types'
import { TimelineObjectCoreExt, VTContent } from 'tv-automation-sofie-blueprints-integration'
import { literal } from '../../../common/util'
import { PartDefinition } from '../../../tv2_afvd_showstyle/inewsConversion/converters/ParseBody'
import { AtemLLayer, CasparLLayer, SisyfosLLAyer } from '../../../tv2_afvd_studio/layers'
import { TimelineBlueprintExt } from '../../../tv2_afvd_studio/onTimelineGenerate'
import { MEDIA_PLAYER_AUTO } from '../../../types/constants'
import { TransitionFromString } from '../transitionFromString'
import { TransitionSettings } from '../transitionSettings'

export function MakeContentServer(
	file: string,
	duration: number,
	mediaPlayerSessionId: string,
	partDefinition: PartDefinition,
	adLib?: boolean
): VTContent {
	return literal<VTContent>({
		studioLabel: '',
		fileName: file,
		path: file,
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
				layer: CasparLLayer.CasparPlayerClipPending,
				content: {
					deviceType: DeviceType.CASPARCG,
					type: TimelineContentTypeCasparCg.MEDIA,
					file,
					length: duration
				},
				metaData: {
					mediaPlayerSession: adLib ? MEDIA_PLAYER_AUTO : mediaPlayerSessionId
				}
			}),

			literal<TimelineObjAtemME & TimelineBlueprintExt>({
				id: '',
				enable: {
					start: 0
				},
				priority: 1,
				layer: AtemLLayer.AtemMEProgram,
				content: {
					deviceType: DeviceType.ATEM,
					type: TimelineContentTypeAtem.ME,
					me: {
						input: undefined,
						transition: partDefinition.transition
							? TransitionFromString(partDefinition.transition.style)
							: AtemTransitionStyle.CUT,
						transitionSettings: TransitionSettings(partDefinition)
					}
				},
				metaData: {
					mediaPlayerSession: adLib ? MEDIA_PLAYER_AUTO : mediaPlayerSessionId
				}
			}),

			literal<TimelineObjSisyfosAny & TimelineBlueprintExt>({
				id: '',
				enable: {
					start: 0
				},
				priority: 1,
				layer: SisyfosLLAyer.SisyfosSourceClipPending,
				content: {
					deviceType: DeviceType.SISYFOS,
					type: TimelineContentTypeSisyfos.SISYFOS,
					isPgm: 1,
					faderLevel: 0.75
				},
				metaData: {
					mediaPlayerSession: adLib ? MEDIA_PLAYER_AUTO : mediaPlayerSessionId
				}
			})
		])
	})
}
