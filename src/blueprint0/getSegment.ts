import * as _ from 'underscore'
import * as objectPath from 'object-path'
import {
	SegmentContext, IngestSegment, BlueprintResultSegment, IBlueprintSegment, BlueprintResultPart, IngestPart, IBlueprintPart, IBlueprintPiece
} from 'tv-automation-sofie-blueprints-integration'
import { literal } from '../common/util'
import { SourceLayer } from '../types/layers'
import { Piece } from '../types/classes'

export function getSegment (context: SegmentContext, ingestSegment: IngestSegment): BlueprintResultSegment {
	const segment = literal<IBlueprintSegment>({
		name: ingestSegment.name,
		metaData: {}
	})

	const parts: BlueprintResultPart[] = []

	if (ingestSegment.payload['float']) {
		return {
			segment,
			parts
		}
	}

	for (const part of ingestSegment.parts) {
		if (!part.payload) {
			// TODO
			context.warning(`Missing payload for part: '${part.name || part.externalId}'`)
		} else if (part.payload['float']) {
			continue
		} else {
			const type = objectPath.get(part.payload, 'type', '') + ''
			if (!type) {
				context.warning(`Missing type for part: '${part.name || part.externalId}'`)
				parts.push(createGeneric(part))
			} else if (type.match(/full/i)) {
				console.log('Creating a full part')
				let pieces: IBlueprintPiece[] = []
				if ('pieces' in part.payload) {
					(part.payload['pieces'] as Piece[]).forEach(piece => {
						if (piece.objectType === 'video') {
							let p = literal<IBlueprintPiece>({
								_id: '',
								externalId: piece.id,
								name: piece.clipName,
								enable: { start: piece.objectTime, end: piece.objectTime + piece.duration },
								outputLayerId: 'pgm0',
								sourceLayerId: SourceLayer.PgmClip
							})
							pieces.push(p)
						}

					})
				} else {
					console.log(`No pieces in part '${part.name}'`)
				}
				parts.push(createPart(part, pieces))
			} else if (type.match(/cam/i)) {
				// TODO
				console.log('hi! Got a cam part!')
				parts.push(createGeneric(part))
			} else if (type.match(/ls/i)) {
				// TODO
				console.log('hi! Got an ls part!')
				parts.push(createGeneric(part))
			} else if (type.match(/split/i)) {
				// TODO
				console.log('hi! Got a split part!')
				parts.push(createGeneric(part))
			} else if (type.match(/head/i)) {
				// TODO
				console.log('hi! Got a head part!')
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

/**
 * Creates a part from an ingest part and associated pieces.
 * @param {IngestPart} ingestPart Ingest part.
 * @param {IBlueprintPiece[]} pieces Array of pieces.
 */
function createPart (ingestPart: IngestPart, pieces: IBlueprintPiece[]): BlueprintResultPart {
	const part = literal<IBlueprintPart>({
		externalId: ingestPart.externalId,
		title: ingestPart.name || 'Unknown',
		metaData: {},
		typeVariant: '',
		expectedDuration: calculateExpectedDuration(pieces)
	})

	return {
		part,
		adLibPieces: [],
		pieces: pieces
	}
}

/**
 * Calculates the expected duration of a part from component pieces.
 * @param {IBlueprintPiece[]} pieces Pieces to calculate duration for.
 */
function calculateExpectedDuration (pieces: IBlueprintPiece[]): number {
	let duration = 0

	pieces.forEach(piece => {
		duration += (piece.enable.duration as number) // This will get more complicated as more rules are added
	})

	return duration
}
