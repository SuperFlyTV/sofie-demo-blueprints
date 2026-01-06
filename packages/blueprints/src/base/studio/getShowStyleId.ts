import { IBlueprintShowStyleBase, IngestRundown, IStudioContext } from '@sofie-automation/blueprints-integration'
import { ReadonlyObjectDeep } from 'type-fest/source/readonly-deep'

export function getShowStyleId(
	_context: IStudioContext,
	showStyles: ReadonlyObjectDeep<IBlueprintShowStyleBase[]>,
	_ingestRundown: IngestRundown
): string | null {
	const showStyle =
		showStyles.find((s) => s._id === 'demo-main-showstyle' || s.blueprintId === 'sofie-showstyle') || showStyles[0]
	if (showStyle) {
		return showStyle._id
	}

	return null
}
