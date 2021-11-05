import { BlueprintResultSegment, IngestSegment, ISegmentUserContext } from '@sofie-automation/blueprints-integration'
import { generateParts } from './part-adapters'
import { convertIngestData } from './spreadsheet-parsers'

export function getSegment(context: ISegmentUserContext, ingestSegment: IngestSegment): BlueprintResultSegment {
	const intermediateSegment = convertIngestData(context, ingestSegment)
	return generateParts(context, intermediateSegment)
}
