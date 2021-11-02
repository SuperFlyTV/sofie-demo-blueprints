import {
	BlueprintResultRundown,
	ExtendedIngestRundown,
	IBlueprintRundown,
	IShowStyleUserContext,
	PlaylistTimingForwardTime,
	PlaylistTimingType,
} from '@sofie-automation/blueprints-integration'
import { literal } from '../../common/util'
import { SpreadsheetIngestRundown } from '../../copy/spreadsheet-gateway'
import { getBaseline } from './baseline'
import { getGlobalAdlibs } from './globalAdlibs'

export function getRundown(
	context: IShowStyleUserContext,
	ingestRundown: ExtendedIngestRundown
): BlueprintResultRundown {
	const rundownMetadata = {}

	const timing: PlaylistTimingForwardTime = {
		type: PlaylistTimingType.ForwardTime,
		expectedStart: 0,
		expectedDuration: 0,
	}
	const rundown = literal<IBlueprintRundown>({
		externalId: ingestRundown.externalId,
		name: ingestRundown.name,
		metaData: rundownMetadata,
		timing
	})

	const res: BlueprintResultRundown = {
		rundown,
		globalAdLibPieces: getGlobalAdlibs(context),
		globalActions: [],
		baseline: getBaseline(context),
	}

	if (ingestRundown.payload) {
		// TODO - maybe guard against unknown types of rundowns?
		const payload: SpreadsheetIngestRundown = ingestRundown.payload

		timing.expectedStart = payload.expectedStart
		timing.expectedDuration = payload.expectedEnd - payload.expectedStart
	}

	return res
}
