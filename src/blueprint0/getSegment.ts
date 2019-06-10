import * as _ from 'underscore'
import * as objectPath from 'object-path'
import {
	SegmentContext, IngestSegment, BlueprintResultSegment, IBlueprintSegment, BlueprintResultPart, IngestPart, IBlueprintPart, IBlueprintPiece, PieceEnable
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
			} else {
				let pieces: IBlueprintPiece[] = []
				if ('pieces' in part.payload) {
					(part.payload['pieces'] as Piece[]).forEach(piece => {
						switch (piece.objectType) {
							case 'video':
								pieces.push(createPieceVideo(piece))
								break
							case 'camera':
								pieces.push(createPieceCam(piece))
								break
							case 'graphic':
								pieces.push(createPieceGraphic(piece))
								break
						}
					})
				}
				parts.push(createPart(part, pieces))
			}
		}
	}

	return {
		segment,
		parts
	}
}

/**
 * Creates a generic piece. Will return an Adlib piece if suitable.
 * @param {Piece} piece Piece to evaluate.
 * @returns {IBlueprintPiece} A possibly infinite, possibly Adlib piece.
 */
function createPieceGeneric (piece: Piece): IBlueprintPiece {
	let enable: PieceEnable = {}

	if (!piece.objectTime) {
		console.log('It\'s an adlib!')
		enable.start = 0
	} else {
		enable.start = piece.objectTime
	}

	if (!piece.duration) {
		console.log('It\'s infinite!')
		enable.duration = 1000
	} else {
		enable.duration = piece.duration
	}

	let p = literal<IBlueprintPiece>({
		_id: '',
		externalId: piece.id,
		name: piece.clipName,
		enable: enable,
		outputLayerId: 'pgm0',
		sourceLayerId: SourceLayer.PgmCam,
		metaData: piece.attributes
	})

	return p
}

/**
 * Creates a cam piece.
 * @param {Piece} piece Piece to evaluate.
 */
function createPieceCam (piece: Piece): IBlueprintPiece {
	let p = createPieceGeneric(piece)

	p.sourceLayerId = SourceLayer.PgmCam
	p.name = piece.attributes['name']

	return p
}

/**
 * Creates a cam piece.
 * @param {Piece} piece Piece to evaluate.
 */
function createPieceVideo (piece: Piece): IBlueprintPiece {
	let p = createPieceGeneric(piece)

	p.sourceLayerId = SourceLayer.PgmClip

	checkAndPlaceOnScreen(p, piece.attributes)

	return p
}

/**
 * Creates a cam piece.
 * @param {Piece} piece Piece to evaluate.
 */
function createPieceGraphic (piece: Piece): IBlueprintPiece {
	let p = createPieceGeneric(piece)

	p.sourceLayerId = SourceLayer.PgmGraphicsSuper

	checkAndPlaceOnScreen(p, piece.attributes)

	return p
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

/**
 * Checks whether a piece should be placed on a screen, if so, it places it on the corresponding screen.
 * @param {IBlueprintPiece} p The Piece blueprint to modify.
 * @param {any} attr Attributes of the piece.
 */
function checkAndPlaceOnScreen (p: IBlueprintPiece, attr: any) {
	if ('name' in attr) {
		if (attr['name'].match(/screen \d/i)) {
			// TODO: this whitespace replacement is due to the current testing environment.
			// 		in future, the 'name' attr should be populated such that it is correct at this point, without string manipulation.
			p.outputLayerId = attr['name'].replace(/\s/g, '')
		}
	}
}
