import { Piece } from '../../types/classes'
import { TimelineEnable } from 'timeline-state-resolver-types/dist/superfly-timeline'

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
