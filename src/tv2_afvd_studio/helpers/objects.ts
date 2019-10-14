import { DeviceType, TimelineContentTypeAtem, TimelineObjAtemAUX } from 'timeline-state-resolver-types'
import { TimelineObjHoldMode } from 'tv-automation-sofie-blueprints-integration'
import { literal } from '../../common/util'
import { AtemLLayer } from '../../tv2_afvd_studio/layers'
import { TimelineBlueprintExt } from '../../tv2_afvd_studio/onTimelineGenerate'

export function atemNextObject(atemInput: number, mediaPlayerSessionId?: string, holdMode?: TimelineObjHoldMode) {
	return literal<TimelineObjAtemAUX & TimelineBlueprintExt>({
		id: '',
		enable: { start: 0 },
		priority: holdMode === TimelineObjHoldMode.ONLY ? 5 : 0, // Must be below lookahead, except when forced by hold
		layer: AtemLLayer.AtemAuxLookahead,
		holdMode,
		content: {
			deviceType: DeviceType.ATEM,
			type: TimelineContentTypeAtem.AUX,
			aux: {
				input: atemInput
			}
		},
		metaData: {
			mediaPlayerSession: mediaPlayerSessionId // TODO - does this work the same?
		}
	})
}
