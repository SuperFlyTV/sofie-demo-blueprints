import {
	IBlueprintPiece
} from 'tv-automation-sofie-blueprints-integration'
import { SourceLayer } from '../types/layers'
import { TimelineEnable } from 'timeline-state-resolver-types/dist/superfly-timeline'

export function literal<T> (o: T) { return o }

export function createVirtualPiece (layer: SourceLayer, enable: number | TimelineEnable, mainPiece?: IBlueprintPiece): IBlueprintPiece {
	return {
		_id: '', name: '',
		externalId: (mainPiece ? mainPiece.externalId : '-'),
		enable: typeof enable === 'number' ? {
			start: enable,
			duration: 0
		} : enable,
		sourceLayerId: layer,
		outputLayerId: 'pgm0',
		virtual: true,
		content: {
			timelineObjects: []
		}
	}
}
