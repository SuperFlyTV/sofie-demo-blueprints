import * as _ from 'underscore'
import * as objectPath from 'object-path'
import {
	SegmentContext, IngestSegment, BlueprintResultSegment, IBlueprintSegment, BlueprintResultPart, IngestPart, IBlueprintSegmentLine
} from 'tv-automation-sofie-blueprints-integration'
import { literal } from '../common/util'

export function getSegment (context: SegmentContext, ingestSegment: IngestSegment): BlueprintResultSegment {
	const segment = literal<IBlueprintSegment>({
		_rank: 0,
		externalId: ingestSegment.externalId,
		runningOrderId: '',
		name: ingestSegment.name,
		metaData: {}
	})

	const parts: BlueprintResultPart[] = []

	for (const part of ingestSegment.parts) {
		if (!part.payload) {
			// TODO
			context.warning(`Missing payload for part: '${part.name || part.externalId}'`)
		} else {
			const type = objectPath.get(part.payload, 'type', '') + ''
			if (!type) {
				context.warning(`Missing type for part: '${part.name || part.externalId}'`)
				parts.push(createGeneric(part))
			} else if (type.match(/full/i)) {
				// TODO
				console.log('hi!')
				parts.push(createGeneric(part))
			} else {
				context.warning(`Missing type '${type}' for part: '${part.name || part.externalId}'`)
				parts.push(createGeneric(part))
			}
		}
	}

	return {
		segment,
		parts
	}
}

function createGeneric (ingestPart: IngestPart): BlueprintResultPart {
	const part = literal<IBlueprintSegmentLine>({
		externalId: ingestPart.externalId,
		title: ingestPart.name || 'Unknown',
		metaData: {},
		typeVariant: ''
	})

	return {
		part,
		adLibPieces: [],
		pieces: []
	}
}
