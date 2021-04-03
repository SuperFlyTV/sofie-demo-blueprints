import { BlueprintResultSegment, IngestSegment, IRundownUserContext } from '@sofie-automation/blueprints-integration'
import { generateParts } from './part-adapters'
import { convertIngestData } from './spreadsheet-parsers'

export function getSegment(context: IRundownUserContext, ingestSegment: IngestSegment): BlueprintResultSegment {
	const intermediateSegment = convertIngestData(context, ingestSegment)
	return generateParts(context, intermediateSegment)
}
