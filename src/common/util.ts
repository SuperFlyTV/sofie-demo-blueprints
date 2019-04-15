import {
	Timeline,
	IBlueprintPiece
} from 'tv-automation-sofie-blueprints-integration'
import { SourceLayer } from '../types/layers'
import { TimelineTrigger } from 'timeline-state-resolver-types/dist/superfly-timeline'

export function literal<T> (o: T) { return o }

export function createVirtualPiece (layer: SourceLayer, trigger: number | TimelineTrigger, mainPiece?: IBlueprintPiece): IBlueprintPiece {
	return {
		_id: '', name: '',
		externalId: (mainPiece ? mainPiece.externalId : '-'),
		trigger: typeof trigger === 'number' ? {
			type: Timeline.TriggerType.TIME_ABSOLUTE,
			value: trigger
		} : trigger,
		sourceLayerId: layer,
		outputLayerId: 'pgm0',
		expectedDuration: 0,
		virtual: true,
		content: {
			timelineObjects: []
		}
	}
}
