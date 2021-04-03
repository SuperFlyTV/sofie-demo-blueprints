import {
	BlueprintResultRundown,
	ExtendedIngestRundown,
	IBlueprintRundown,
	IShowStyleUserContext,
} from '@sofie-automation/blueprints-integration'
import { literal } from '../../common/util'
import { SpreadsheetIngestRundown } from '../../copy/spreadsheet-gateway'
import { getGlobalAdlibs } from './globalAdlibs'

export function getRundown(
	context: IShowStyleUserContext,
	ingestRundown: ExtendedIngestRundown
): BlueprintResultRundown {
	const rundownMetadata = {}

	const rundown = literal<IBlueprintRundown>({
		externalId: ingestRundown.externalId,
		name: ingestRundown.name,
		expectedStart: 0,
		expectedDuration: 0,
		metaData: rundownMetadata,
	})

	const res: BlueprintResultRundown = {
		rundown,
		globalAdLibPieces: getGlobalAdlibs(context),
		globalActions: [],
		baseline: [],
	}

	if (ingestRundown.payload) { // TODO - maybe guard against unknown types of rundowns?
		const payload: SpreadsheetIngestRundown = ingestRundown.payload

		res.rundown.expectedStart = payload.expectedStart
		res.rundown.expectedDuration = payload.expectedEnd - payload.expectedStart
	}

	return res
}
