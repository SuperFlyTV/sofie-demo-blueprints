import * as _ from 'underscore'

import {
	SegmentContext,
	PostProcessResult
} from 'tv-automation-sofie-blueprints-integration'

export default function (_context: SegmentContext): PostProcessResult {
	return {
		segmentLineItems: [],
		segmentLineUpdates: []
	}
}
