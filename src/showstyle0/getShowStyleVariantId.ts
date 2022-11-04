import {
	ExtendedIngestRundown,
	IBlueprintShowStyleVariant,
	IStudioUserContext,
} from '@sofie-automation/blueprints-integration'
import { ReadonlyObjectDeep } from 'type-fest/source/readonly-deep'
// import _ = require('underscore')

export function getShowStyleVariantId(
	_context: IStudioUserContext,
	showStyleVariants: ReadonlyObjectDeep<IBlueprintShowStyleVariant[]>,
	_ingestRundown: ExtendedIngestRundown
): string | null {
	// Here you could parse bits of the rundown to decide which showstyle variant the rundown should have

	// TODO - the fallback used below doesn't work for some reason
	for (const variant of showStyleVariants) {
		return variant._id
	}

	// Fallback to the first
	const firstVariant = showStyleVariants[0] // _.first(showStyleVariants)
	if (firstVariant) {
		return firstVariant._id
	}
	// return 'HhhhArAYKMBL42oaG'
	return null
}
