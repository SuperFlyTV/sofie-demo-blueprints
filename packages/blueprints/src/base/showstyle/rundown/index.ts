import {
	BlueprintResultRundown,
	ExtendedIngestRundown,
	IBlueprintRundown,
	IShowStyleUserContext,
	PlaylistTimingForwardTime,
	PlaylistTimingType,
} from '@sofie-automation/blueprints-integration'
import { literal } from '../../../common/util'
import { SpreadsheetIngestRundown } from '../../../copy/spreadsheet-gateway'
import { RundownMetadata } from '../helpers/metadata'
import { getBaseline } from './baseline'
import { getGlobalActions } from './globalActions'
import { getGlobalAdlibs } from './globalAdlibs'

export function getRundown(
	context: IShowStyleUserContext,
	ingestRundown: ExtendedIngestRundown
): BlueprintResultRundown {
	const rundownMetadata: RundownMetadata = {
		ingestType: ingestRundown.type,
	}

	const timing: PlaylistTimingForwardTime = {
		type: PlaylistTimingType.ForwardTime,
		expectedStart: 0,
		expectedDuration: 0,
	}
	const rundown = literal<IBlueprintRundown>({
		externalId: ingestRundown.externalId,
		name: ingestRundown.name,
		privateData: rundownMetadata,
		timing,
	})

	const res: BlueprintResultRundown = {
		rundown,
		globalAdLibPieces: getGlobalAdlibs(context),
		globalActions: getGlobalActions(context, ingestRundown),
		baseline: getBaseline(context),
	}

	if (ingestRundown.payload) {
		const payload = ingestRundown.payload as SpreadsheetIngestRundown
		// Guard against missing or faulty payload:
		if ((payload.externalId, payload.name, payload.expectedStart, payload.expectedEnd)) {
			timing.expectedStart = payload.expectedStart
			timing.expectedDuration = payload.expectedEnd - payload.expectedStart
		}
	}

	return res
}
