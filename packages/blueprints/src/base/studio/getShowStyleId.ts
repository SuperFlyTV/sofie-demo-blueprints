import { IBlueprintShowStyleBase, IngestRundown, IStudioContext } from '@sofie-automation/blueprints-integration'
import { ReadonlyObjectDeep } from 'type-fest/source/readonly-deep'
import * as _ from 'underscore'

export function getShowStyleId(
	_context: IStudioContext,
	showStyles: ReadonlyObjectDeep<IBlueprintShowStyleBase[]>,
	_ingestRundown: IngestRundown
): string | null {
	const showStyle =
		_.find(showStyles, (s) => s._id === 'demo-main-showstyle' || s.blueprintId === 'sofie-showstyle') || _.first(showStyles)
	if (showStyle) {
		return showStyle._id
	}

	return null
}
