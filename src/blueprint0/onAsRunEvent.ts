import * as _ from 'underscore'
import {
	IBlueprintExternalMessageQueueObj,
	EventContext,
	AsRunEventContext
} from 'tv-automation-sofie-blueprints-integration'

/**
 * This function is called whenever an item in the as-run-log is created
 */
export default function (_context: EventContext & AsRunEventContext): Promise<IBlueprintExternalMessageQueueObj[]> {
	return Promise.resolve([])
}
