import {
	BlueprintResultPart,
	BlueprintResultSegment,
	IBlueprintPart,
	IBlueprintSegment,
	IngestSegment,
	SegmentContext
} from 'tv-automation-sofie-blueprints-integration'
import * as _ from 'underscore'
import { assertUnreachable, literal } from '../common/util'
import { ParseBody, PartDefinition, PartType } from './inewsConversion/converters/ParseBody'
import { CreatePartAttack } from './parts/attack'
import { CreatePartGrafik } from './parts/grafik'
import { CreatePartKada } from './parts/kada'
import { CreatePartKam } from './parts/kam'
import { CreatePartLive } from './parts/live'
import { CreatePartNedlæg } from './parts/nedlæg'
import { CreatePartSB } from './parts/sb'
import { CreatePartServer } from './parts/server'
import { CreatePartSlutord } from './parts/slutord'
import { CreatePartStep } from './parts/step'
import { CreatePartTeknik } from './parts/teknik'
import { CreatePartVO } from './parts/vo'

export function getSegment(context: SegmentContext, ingestSegment: IngestSegment): BlueprintResultSegment {
	const segment = literal<IBlueprintSegment>({
		name: ingestSegment.name,
		metaData: {}
	})

	if (ingestSegment.payload.float === 'true') {
		return {
			segment,
			parts: []
		}
	}

	const blueprintParts: BlueprintResultPart[] = []
	const parsedParts = ParseBody(
		ingestSegment.externalId,
		ingestSegment.payload.iNewsStory.body,
		ingestSegment.payload.iNewsStory.cues
	)
	parsedParts.forEach(part => {
		switch (part.type) {
			case PartType.Kam:
				blueprintParts.push(CreatePartKam(part))
				break
			case PartType.Server:
				blueprintParts.push(CreatePartServer(part))
				break
			case PartType.Live:
				blueprintParts.push(CreatePartLive(part))
				break
			case PartType.Teknik:
				blueprintParts.push(CreatePartTeknik(part))
				break
			case PartType.Slutord:
				blueprintParts.push(CreatePartSlutord(part))
				break
			case PartType.Grafik:
				blueprintParts.push(CreatePartGrafik(part))
				break
			case PartType.VO:
				blueprintParts.push(CreatePartVO(part))
				break
			case PartType.Attack:
				blueprintParts.push(CreatePartAttack(part))
				break
			case PartType.NEDLÆG:
				blueprintParts.push(CreatePartNedlæg(part))
				break
			case PartType.SB:
				blueprintParts.push(CreatePartSB(part))
				break
			case PartType.STEP:
				blueprintParts.push(CreatePartStep(part))
				break
			case PartType.KADA:
				blueprintParts.push(CreatePartKada(part))
				break
			case PartType.Unknown:
				context.warning(`Unknown part type for part ${part.rawType} with id ${part.externalId}`)
				blueprintParts.push(createInvalidPart(part))
				break
			default:
				assertUnreachable(part)
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
