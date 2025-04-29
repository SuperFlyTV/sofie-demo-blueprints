import {
	BlueprintResultSegment,
	IBlueprintRundown,
	IngestSegment,
	ISegmentUserContext,
} from '@sofie-automation/blueprints-integration'
import { RundownMetadata } from './helpers/metadata'
import { generateParts } from './part-adapters'
import { convertIngestData as convertEditorIngestData } from './sofie-editor-parsers'
import { convertIngestData as convertSpreadsheetIngestData } from './spreadsheet-parsers'

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
