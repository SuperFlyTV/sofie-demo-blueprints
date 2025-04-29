import {
	BlueprintResultSegment,
	IBlueprintRundown,
	IngestSegment,
	ISegmentUserContext,
} from '@sofie-automation/blueprints-integration'
import { RundownMetadata } from './helpers/metadata.js'
import { generateParts } from './part-adapters/index.js'
import { convertIngestData as convertEditorIngestData } from './sofie-editor-parsers/index.js'
import { convertIngestData as convertSpreadsheetIngestData } from './spreadsheet-parsers/index.js'

export function getSegment(context: ISegmentUserContext, ingestSegment: IngestSegment): BlueprintResultSegment {
	const rundownType = (context.rundown as Readonly<IBlueprintRundown<RundownMetadata>>).privateData?.ingestType

	let intermediateSegment
	switch (rundownType) {
		case 'sofie-rundown-editor':
			console.log('Using Sofie Rundown Editor ingest data')
			intermediateSegment = convertEditorIngestData(context, ingestSegment)
			break
		default:
			console.log('Using Spreadsheet ingest data')
			intermediateSegment = convertSpreadsheetIngestData(context, ingestSegment)
	}

	return generateParts(context, intermediateSegment)
}
