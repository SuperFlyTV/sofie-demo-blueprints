import { IStudioContext, IngestRunningOrder } from 'tv-automation-sofie-blueprints-integration'
import * as _ from 'underscore'

export function getShowStyleId (context: IStudioContext, _ingestRunningOrder: IngestRunningOrder): string | null {
	const showStyles = context.getShowStyleBases()

	const showStyle = _.first(showStyles)
	if (showStyle) {
		return showStyle._id
	}

	return null
}
