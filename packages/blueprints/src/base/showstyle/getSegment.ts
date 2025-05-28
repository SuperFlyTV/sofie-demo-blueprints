import {
	BlueprintResultSegment,
	IBlueprintRundown,
	ISegmentUserContext,
	SofieIngestSegment,
} from '@sofie-automation/blueprints-integration'
import { RundownMetadata } from './helpers/metadata.js'
import { generateParts } from './part-adapters/index.js'
import { convertIngestData as convertEditorIngestData } from './sofie-editor-parsers/index.js'
import { convertIngestData as convertSpreadsheetIngestData } from './spreadsheet-parsers/index.js'
import { SegmentProps } from './definitions/index.js'

// Get segment is called from Core and is the main entry point for the blueprint for receiving segments
export function getSegment(context: ISegmentUserContext, ingestSegment: SofieIngestSegment): BlueprintResultSegment {
	const rundownType = (context.rundown as Readonly<IBlueprintRundown<RundownMetadata>>).privateData?.ingestType
	let intermediateSegment: SegmentProps
	switch (rundownType) {
		case 'sofie-rundown-editor':
			context.logDebug('Using Sofie Rundown Editor ingest data')
			intermediateSegment = convertEditorIngestData(context, ingestSegment)
			break
		default:
			context.logDebug('Using Spreadsheet ingest data')
			intermediateSegment = convertSpreadsheetIngestData(context, ingestSegment)
	}

	// As there's an extra step because of supporting both Rundown Editor and Spreadsheet ingest data,
	// we need to make sure to parse the userEditStates on the intermediateSegment:
	intermediateSegment = {
		...intermediateSegment,
		userEditStates: {
			...ingestSegment.userEditStates,
		},
	}

	context.logDebug('Intermediate segment: ' + JSON.stringify(intermediateSegment))

	return generateParts(context, intermediateSegment)
}
