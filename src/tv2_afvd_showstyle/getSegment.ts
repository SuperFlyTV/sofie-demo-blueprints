// import * as objectPath from 'object-path'
import {
	BlueprintResultPart,
	BlueprintResultSegment,
	// IBlueprintAdLibPiece,
	IBlueprintPart,
	IBlueprintPiece,
	IBlueprintSegment,
	// IngestPart,
	IngestSegment,
	SegmentContext
} from 'tv-automation-sofie-blueprints-integration'
import * as _ from 'underscore'
import { assertUnreachable, literal } from '../common/util'
import { INewsIngestSegment, ParseBody, PartDefinition, PartType } from './inewsConversion/converters/ParseBody'
// import { SegmentConf } from '../types/classes'
// import { parseConfig } from './helpers/config'
// import { SplitStoryDataToParts } from './inewsConversion/converters/SplitStoryDataToParts'
import { SourceLayer } from './layers'
// import { GetTimeFromPart } from './helpers/time'

export function getSegment(context: SegmentContext, ingestSegment: IngestSegment): BlueprintResultSegment {
	// const config: SegmentConf = {
	// 	context,
	// 	config: parseConfig(context),
	// 	frameHeight: 1920,
	// 	frameWidth: 1080,
	// 	framesPerSecond: 50
	// }
	const segment = literal<IBlueprintSegment>({
		name: ingestSegment.name,
		metaData: {}
	})

	// console.log(config)

	if (ingestSegment.payload.float === 'true') {
		return {
			segment,
			parts: []
		}
	}

	const blueprintParts: BlueprintResultPart[] = []
	const parsedParts = ParseBody(ingestSegment as INewsIngestSegment)
	parsedParts.forEach(part => {
		switch (part.type) {
			case PartType.Kam:
				blueprintParts.push(CreateKam(part))
				break
			case PartType.Server:
			case PartType.VO:
			case PartType.Live:
			case PartType.Unknown:
				context.warning(`Unknown part type for part ${part.rawType}`)
				blueprintParts.push(createInvalidPart(part))
				break
			default:
				assertUnreachable(part.type)
				break
		}
	})

	if (blueprintParts.length > 1) {
		blueprintParts.forEach((part, i) => {
			if (i === 0) {
				part.part.displayDuration = parseInt(ingestSegment.payload.iNewsStory.fields.totalTime, 10) * 1000 || 10000
				// TODO - remove this default time
			}

			part.part.displayDurationGroup = ingestSegment.externalId
		})
	}

	return {
		segment,
		parts: blueprintParts
	}
}

function createInvalidPart(ingestPart: PartDefinition): BlueprintResultPart {
	const part = literal<IBlueprintPart>({
		externalId: ingestPart.externalId,
		title: ingestPart.rawType || 'Unknown',
		metaData: {},
		typeVariant: '',
		invalid: true
	})

	return {
		part,
		adLibPieces: [],
		pieces: []
	}
}

/**
 * Creates a generic part. Only used as a placeholder for part types that have not been implemented yet.
 * @param {Piece} piece Piece to evaluate.
 */
function createGeneric(ingestPart: PartDefinition): BlueprintResultPart {
	const part = literal<IBlueprintPart>({
		externalId: ingestPart.externalId,
		title: PartType[ingestPart.type] + ' - ' + ingestPart.rawType,
		metaData: {},
		typeVariant: '',
		expectedDuration: 0
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

// /**
//  * Creates a part from an ingest part and associated pieces.
//  * @param {IngestPart} ingestPart Ingest part.
//  * @param {IBlueprintPiece[]} pieces Array of pieces.
//  */
// function createPart(
// 	ingestPart: IngestPart,
// 	pieces: IBlueprintPiece[],
// 	adLibPieces: IBlueprintAdLibPiece[]
// ): BlueprintResultPart {
// 	const part = literal<IBlueprintPart>({
// 		externalId: ingestPart.externalId,
// 		title: ingestPart.name || 'Unknown',
// 		metaData: {},
// 		typeVariant: '',
// 		expectedDuration: calculateExpectedDuration(pieces)
// 	})

// 	return {
// 		part,
// 		adLibPieces,
// 		pieces
// 	}
// }

// /**
//  * Calculates the expected duration of a part from component pieces.
//  * @param {IBlueprintPiece[]} pieces Pieces to calculate duration for.
//  */
// function calculateExpectedDuration(pieces: IBlueprintPiece[]): number {
// 	if (pieces.length) {
// 		let start = 0
// 		let end = 0

// 		pieces.forEach(piece => {
// 			if (!piece.isTransition) {
// 				const st = piece.enable.start as number
// 				let en = piece.enable.start as number
// 				if (piece.enable.duration) {
// 					en = (piece.enable.start as number) + (piece.enable.duration as number)
// 				} else if (piece.enable.end) {
// 					en = piece.enable.end as number
// 				}

// 				if (piece.infiniteMode) {
// 					en = en + 1000
// 				}

// 				if (st < start) {
// 					start = st
// 				}

// 				if (en > end) {
// 					end = en
// 				}

// 				if (st > end) {
// 					end = st
// 				}
// 			}
// 		})

// 		return end - start
// 	}
// 	return 0
// }
