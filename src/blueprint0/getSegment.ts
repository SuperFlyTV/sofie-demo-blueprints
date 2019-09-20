import * as _ from 'underscore'
import * as objectPath from 'object-path'
import {
	SegmentContext, IngestSegment, BlueprintResultSegment, IBlueprintSegment, BlueprintResultPart, IngestPart, IBlueprintPart, IBlueprintPiece
} from 'tv-automation-sofie-blueprints-integration'
import { literal } from '../common/util'
import { SegmentConf } from '../types/classes'
import { parseConfig } from './helpers/config'
import { parseSources } from './helpers/sources'
import { SourceLayer } from '../types/layers'

export function getSegment (context: SegmentContext, ingestSegment: IngestSegment): BlueprintResultSegment {
	const config: SegmentConf = {
		context: context,
		config: parseConfig(context),
		sourceConfig: parseSources(context, parseConfig(context)),
		frameHeight: 1920,
		frameWidth: 1080,
		framesPerSecond: 50
	}
	const segment = literal<IBlueprintSegment>({
		name: ingestSegment.name,
		metaData: {}
	})
	const parts: BlueprintResultPart[] = []
	console.log(config)

	if (ingestSegment.payload['float']) {
		return {
			segment,
			parts
		}
	}

	for (const part of ingestSegment.parts) {
		if (!part.payload) {
			context.warning(`Missing payload for part: '${part.name || part.externalId}'`)
		} else if (part.payload['float']) {
			continue
		} else {
			const type = objectPath.get(part.payload, 'type', '') + ''
			if (!type) {
				context.warning(`Missing type for part: '${part.name || part.externalId}'`)
				parts.push(createGeneric(part))
			} else {
				parts.push(createGeneric(part))
			}
		}
	}

	return {
		segment,
		parts
	}
}

/**
 * Creates a generic part. Only used as a placeholder for part types that have not been implemented yet.
 * @param {Piece} piece Piece to evaluate.
 */
function createGeneric (ingestPart: IngestPart): BlueprintResultPart {
	const part = literal<IBlueprintPart>({
		externalId: ingestPart.externalId,
		title: ingestPart.name || 'Unknown',
		metaData: {},
		typeVariant: '',
		expectedDuration: 5000
	})

	const piece = literal<IBlueprintPiece>({
		_id: '',
		externalId: ingestPart.externalId,
		name: part.title,
		enable: { start: 0, duration: 100 },
		outputLayerId: 'pgm0',
		sourceLayerId: SourceLayer.PgmCam
	})

	return {
		part,
		adLibPieces: [],
		pieces: [piece]
	}
}
