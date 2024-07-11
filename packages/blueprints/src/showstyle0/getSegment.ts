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
			intermediateSegment = convertEditorIngestData(context, ingestSegment)
			break
		default:
			intermediateSegment = convertSpreadsheetIngestData(context, ingestSegment)
	}

	return generateParts(context, intermediateSegment)
}
