import { TimelineEnable } from 'timeline-state-resolver-types/dist/superfly-timeline'
import { Piece } from '../../types/classes'

/**
 * Creates an enable object for a timeline object.
 * @param {Piece} piece Piece to create enable for.
 */
export function CreateEnableForTimelineObject (piece: Piece, delay?: number): TimelineEnable {
	let enable: TimelineEnable = {
		start: delay ? delay : 0
	}

	if (piece.duration) {
		enable.duration = piece.duration
	}

	return enable
}
