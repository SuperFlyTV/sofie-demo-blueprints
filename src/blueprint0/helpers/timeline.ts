import { Piece } from '../../types/classes'
import { TimelineEnable } from 'timeline-state-resolver-types/dist/superfly-timeline'
import { literal } from '../../common/util'
import { TimelineObjAtemME, AtemTransitionStyle, DeviceType, TimelineContentTypeAtem, TimelineContentTypeLawo, TimelineObjLawoSource, TimelineContentTypeCasparCg, TimelineObjCCGMedia } from 'timeline-state-resolver-types'
import { AtemLLayer, LawoLLayer, CasparLLayer } from '../../types/layers'

/**
 * Creates an enable object for a timeline object.
 * @param {Piece} piece Piece to create enable for.
 */
export function CreateEnableForTimelineObject (piece: Piece): TimelineEnable {
	let enable: TimelineEnable = {
		start: piece.objectTime ? piece.objectTime : 0
	}

	if (piece.duration) {
		enable.duration = piece.duration
	}

	return piece
}

/**
 * Creates a timeline object for an ATEM transition.
 * @param {TimelineEnable} enable Timeline object enable.
 * @param {AtemTransitionStyle} transition Transition to use.
 */
export function CreateTransitionAtemTimelineObject (enable: TimelineEnable, transition: AtemTransitionStyle, input: number): TimelineObjAtemME {
	return literal<TimelineObjAtemME>({
		id: '',
		enable: enable,
		priority: 5,
		layer: AtemLLayer.AtemMEProgram,
		content: {
			deviceType: DeviceType.ATEM,
			type: TimelineContentTypeAtem.ME,
			me: {
				input: input, // TODO: Get from Sofie.
				transition: transition,
				transitionSettings: {
					mix: {
						rate: 0
					}
				}
			}
		}
	})
}

/**
 * Creates a timeline object for a LAWO automix.
 * @param {TimelineEnable} enable Timeline object enable.
 */
export function CreateLawoAutomixTimelineObject (enable: TimelineEnable): TimelineObjLawoSource {
	return literal<TimelineObjLawoSource>({
		id: '',
		enable: enable,
		priority: 1,
		layer: LawoLLayer.LawoSourceAutomix,
		content: {
			deviceType: DeviceType.LAWO,
			type: TimelineContentTypeLawo.SOURCE,
			'Fader/Motor dB Value': {
				value: 0,
				transitionDuration: 1
			}
		}
	})
}

/**
 * Creates a timeline object for a CCG media item
 * @param {TimelineEnable} enable Timeline object enable.
 * @param {CasparLLayer} layer Output layer.
 * @param {string} file File to play.
 */
export function CreateCCGMediaTimelineObject (enable: TimelineEnable, layer: CasparLLayer, file: string) {
	return literal<TimelineObjCCGMedia>({
		id: '',
		enable: enable,
		priority: 1,
		layer: layer,
		content: {
			deviceType: DeviceType.CASPARCG,
			type: TimelineContentTypeCasparCg.MEDIA,
			file: file
		}
	})
}
