import { TimelineEnable } from 'timeline-state-resolver-types/dist/superfly-timeline'
import { IBlueprintAdLibPiece, IBlueprintPiece } from 'tv-automation-sofie-blueprints-integration'
import { SourceLayer } from '../types/layers'

export function literal<T>(o: T) {
	return o
}

export function createVirtualPiece(
	layer: SourceLayer,
	enable: number | TimelineEnable,
	mainPiece?: IBlueprintPiece
): IBlueprintPiece {
	return {
		_id: '',
		name: '',
		externalId: mainPiece ? mainPiece.externalId : '-',
		enable:
			typeof enable === 'number'
				? {
						start: enable,
						duration: 0
				  }
				: enable,
		sourceLayerId: layer,
		outputLayerId: 'pgm0',
		virtual: true,
		content: {
			timelineObjects: []
		}
	}
}

/**
 * Returs true if the piece is interface IBlueprintAdLibPiece
 * @param {IBlueprintPiece | IBlueprintAdLibPiece} piece Piece to check
 */
export function isAdLibPiece(piece: IBlueprintPiece | IBlueprintAdLibPiece) {
	return '_rank' in piece
}
