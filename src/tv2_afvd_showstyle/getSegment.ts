import {
	BlueprintResultPart,
	BlueprintResultSegment,
	IBlueprintRundownDB,
	IBlueprintSegment,
	IngestSegment,
	PartContext,
	SegmentContext
} from 'tv-automation-sofie-blueprints-integration'
import * as _ from 'underscore'
import { assertUnreachable, literal } from '../common/util'
import { parseConfig } from './helpers/config'
import { ParseBody, PartType } from './inewsConversion/converters/ParseBody'
import { CreatePartFake } from './parts/fake'
import { CreatePartGrafik } from './parts/grafik'
import { CreatePartKam } from './parts/kam'
import { CreatePartLive } from './parts/live'
import { CreatePartServer } from './parts/server'
import { CreatePartTeknik } from './parts/teknik'
import { CreatePartUnknown } from './parts/unknown'
import { CreatePartVO } from './parts/vo'

const DEBUG_LAYERS = false // TODO: Remove for production, used show all source layers even without parts.

export function getSegment(context: SegmentContext, ingestSegment: IngestSegment): BlueprintResultSegment {
	const segment = literal<IBlueprintSegment>({
		name: ingestSegment.name,
		metaData: {}
	})
	const config = parseConfig(context)

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
		ingestSegment.payload.iNewsStory.cues,
		ingestSegment.payload.iNewsStory.fields,
		ingestSegment.payload.iNewsStory.fields.modifyDate
	)
	parsedParts.forEach((part, i) => {
		if (i === 0 && DEBUG_LAYERS) {
			blueprintParts.push(CreatePartFake(part))
		}
		const partContext = new PartContext2(context, part.externalId)
		switch (part.type) {
			case PartType.Kam:
				blueprintParts.push(CreatePartKam(partContext, config, part))
				break
			case PartType.Server:
				blueprintParts.push(CreatePartServer(partContext, config, part, part.externalId))
				break
			case PartType.Live:
				blueprintParts.push(CreatePartLive(partContext, config, part))
				break
			case PartType.Teknik:
				blueprintParts.push(CreatePartTeknik(partContext, config, part))
				break
			case PartType.Grafik:
				blueprintParts.push(CreatePartGrafik(part))
				break
			case PartType.VO:
				blueprintParts.push(CreatePartVO(part))
				break
			case PartType.Unknown:
				// context.warning(`Unknown part type for part ${part.rawType} with id ${part.externalId}`)
				blueprintParts.push(CreatePartUnknown(partContext, config, part))
				break
			default:
				assertUnreachable(part)
				break
		}
	})

	/*if (blueprintParts.length > 1) {
		blueprintParts.forEach((part, i) => {
			if (i === 0) {
				part.part.displayDuration = parseInt(ingestSegment.payload.iNewsStory.fields.totalTime, 10) * 1000 || 10000
				// TODO - remove this default time
			}

			part.part.displayDurationGroup = ingestSegment.externalId
		})
	}*/

	return {
		segment,
		parts: blueprintParts
	}
}

class PartContext2 implements PartContext {
	public readonly rundownId: string
	public readonly rundown: IBlueprintRundownDB
	private baseContext: SegmentContext
	private externalId: string

	constructor(baseContext: SegmentContext, externalId: string) {
		this.baseContext = baseContext
		this.externalId = externalId

		this.rundownId = baseContext.rundownId
		this.rundown = baseContext.rundown
	}

	/** PartContext */
	public getRuntimeArguments() {
		return this.baseContext.getRuntimeArguments(this.externalId) || {}
	}

	/** IShowStyleConfigContext */
	public getShowStyleConfig() {
		return this.baseContext.getShowStyleConfig()
	}
	public getShowStyleConfigRef(configKey: string) {
		return this.baseContext.getShowStyleConfigRef(configKey)
	}

	/** IStudioContext */
	public getStudioMappings() {
		return this.baseContext.getStudioMappings()
	}

	/** IStudioConfigContext */
	public getStudioConfig() {
		return this.baseContext.getStudioConfig()
	}
	public getStudioConfigRef(configKey: string) {
		return this.baseContext.getStudioConfigRef(configKey)
	}

	/** NotesContext */
	public error(message: string) {
		return this.baseContext.error(message)
	}
	public warning(message: string) {
		return this.baseContext.warning(message)
	}
	public getNotes() {
		return this.baseContext.getNotes()
	}

	/** ICommonContext */
	public getHashId(originString: string, originIsNotUnique?: boolean) {
		return this.baseContext.getHashId(`${this.externalId}_${originString}`, originIsNotUnique)
	}
	public unhashId(hash: string) {
		return this.baseContext.unhashId(hash)
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
