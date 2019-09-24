import * as _ from 'underscore'
import * as objectPath from 'object-path'
import {
	SegmentContext, IngestSegment, IngestPart, BlueprintResultSegment, IBlueprintSegment, BlueprintResultPart, IBlueprintPart, IBlueprintPiece, IBlueprintAdLibPiece
} from 'tv-automation-sofie-blueprints-integration'
import { literal } from '../common/util'
import { SegmentConf, Piece } from '../types/classes'
import { parseConfig } from './helpers/config'
import { parseSources } from './helpers/sources'
import { SourceLayer } from '../types/layers'
import { SplitStoryDataToParts } from './inewsConversion/converters/SplitStoryDataToParts'

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

	if (ingestSegment.payload ['float'] === 'true') {
		return {
			segment,
			parts
		}
	}

	let { allParts } = SplitStoryDataToParts.convert(ingestSegment.payload.iNewsStory)
	let ingestParts: IngestPart[] = allParts.map((part: any) => {
		return {
			externalId: part.data.id,
			name: part.data.name,
			rank: 0, // ??????
			payload: part.data
		}
	})

	for (const part of ingestParts) {
		const type = objectPath.get(part.payload, 'type', '') + ''
		if (!type) {
			context.warning(`Missing type for part: '${part.name || part.externalId}'`)
			parts.push(createGeneric(part))
		} else {
			let pieces: IBlueprintPiece[] = []
			let adLibPieces: IBlueprintAdLibPiece[] = []
			if ('pieces' in part) {
				let pieceList = part['pieces'] as Piece[]
				pieceList.forEach((piece) => {
					if (piece.objectType === 'camera') {
						pieces.push({
							_id: piece.id,
							enable: {
								start: 0,
								duration: piece.duration
							},
							externalId: piece.id,
							name: '',
							sourceLayerId: SourceLayer.PgmCam,
							outputLayerId: 'pgm0',
							content: {}
						})
					}
				})
			}
			parts.push(createPart(part, pieces, adLibPieces))
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

/**
 * Creates a part from an ingest part and associated pieces.
 * @param {IngestPart} ingestPart Ingest part.
 * @param {IBlueprintPiece[]} pieces Array of pieces.
 */
function createPart (ingestPart: IngestPart, pieces: IBlueprintPiece[], adLibPieces: IBlueprintAdLibPiece[]): BlueprintResultPart {
	const part = literal<IBlueprintPart>({
		externalId: ingestPart.externalId,
		title: ingestPart.name || 'Unknown',
		metaData: {},
		typeVariant: '',
		expectedDuration: calculateExpectedDuration(pieces)
	})

	return {
		part,
		adLibPieces: adLibPieces,
		pieces: pieces
	}
}

/**
 * Calculates the expected duration of a part from component pieces.
 * @param {IBlueprintPiece[]} pieces Pieces to calculate duration for.
 */
function calculateExpectedDuration (pieces: IBlueprintPiece[]): number {
	if (pieces.length) {
		let start = 0
		let end = 0

		pieces.forEach(piece => {
			if (!piece.isTransition) {
				let st = piece.enable.start as number
				let en = piece.enable.start as number
				if (piece.enable.duration) {
					en = (piece.enable.start as number) + (piece.enable.duration as number)
				} else if (piece.enable.end) {
					en = (piece.enable.end as number)
				}

				if (piece.infiniteMode) {
					en = en + 1000
				}

				if (st < start) {
					start = st
				}

				if (en > end) {
					end = en
				}

				if (st > end) {
					end = st
				}
			}
		})

		return end - start
	}
	return 0
}
