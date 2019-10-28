import {
	BlueprintResultPart,
	BlueprintResultSegment,
	IBlueprintPiece,
	IBlueprintRundownDB,
	IBlueprintSegment,
	IngestSegment,
	PartContext,
	ScriptContent,
	SegmentContext
} from 'tv-automation-sofie-blueprints-integration'
import * as _ from 'underscore'
import { assertUnreachable, literal } from '../common/util'
import { parseConfig } from './helpers/config'
import { ParseBody, PartDefinition, PartDefinitionSlutord, PartType } from './inewsConversion/converters/ParseBody'
import { SourceLayer } from './layers'
import { CreatePartFake } from './parts/fake'
import { CreatePartGrafik } from './parts/grafik'
import { CreatePartIntro } from './parts/intro'
import { CreatePartInvalid } from './parts/invalid'
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
		ingestSegment.name,
		ingestSegment.payload.iNewsStory.body,
		ingestSegment.payload.iNewsStory.cues,
		ingestSegment.payload.iNewsStory.fields,
		ingestSegment.payload.iNewsStory.fields.modifyDate
	)
	const totalWords = ingestSegment.payload.iNewsStory.meta.words || 0
	for (let i = 0; i < parsedParts.length; i++) {
		const part = parsedParts[i]
		if (i === 0 && DEBUG_LAYERS) {
			blueprintParts.push(CreatePartFake(part))
		}
		const partContext = new PartContext2(context, part.externalId)
		switch (part.type) {
			case PartType.INTRO:
				blueprintParts.push(CreatePartIntro(partContext, config, part, totalWords))
				break
			case PartType.Kam:
				blueprintParts.push(CreatePartKam(partContext, config, part, totalWords))
				break
			case PartType.Server:
				blueprintParts.push(CreatePartServer(partContext, config, part))
				break
			case PartType.Live:
				blueprintParts.push(CreatePartLive(partContext, config, part, totalWords))
				break
			case PartType.Teknik:
				blueprintParts.push(CreatePartTeknik(partContext, config, part, totalWords))
				break
			case PartType.Grafik:
				// TODO: This part
				blueprintParts.push(CreatePartGrafik(part))
				context.warning(`GRAFIK Part, not implemented yet`)
				break
			case PartType.VO:
				// TODO: This part
				blueprintParts.push(CreatePartVO(part))
				context.warning(`VO Part, not implemented yet`)
				break
			case PartType.Unknown:
				// context.warning(`Unknown part type for part ${part.rawType} with id ${part.externalId}`)
				blueprintParts.push(CreatePartUnknown(partContext, config, part))
				context.warning('Unknown part type')
				break
			case PartType.Slutord:
				blueprintParts.push(CreatePartInvalid(part))
				context.warning('Slutord should have been filtered out by now, something may have gone wrong')
				break
			default:
				assertUnreachable(part)
				break
		}
		if (SlutordLookahead(parsedParts, i, blueprintParts)) {
			i++
		}
	}

	return {
		segment,
		parts: blueprintParts
	}
}

function SlutordLookahead(
	parsedParts: PartDefinition[],
	currentIndex: number,
	blueprintParts: BlueprintResultPart[]
): boolean {
	// Check if next part is Slutord
	if (currentIndex + 1 < parsedParts.length) {
		if (parsedParts[currentIndex + 1].type === PartType.Slutord) {
			const part = (parsedParts[currentIndex + 1] as unknown) as PartDefinitionSlutord
			// If it's attached to a server and has some content
			if (parsedParts[currentIndex].type === PartType.Server && part.variant.endWords) {
				blueprintParts[blueprintParts.length - 1].pieces.push(
					literal<IBlueprintPiece>({
						_id: '',
						name: `Slutord: ${part.variant.endWords}`,
						sourceLayerId: SourceLayer.PgmScript,
						outputLayerId: 'pgm0',
						externalId: parsedParts[currentIndex].externalId,
						enable: {
							start: 0
						},
						content: literal<ScriptContent>({
							firstWords: '',
							lastWords: part.variant.endWords,
							fullScript: part.variant.endWords
						})
					})
				)
			}
			return true
		}
	}

	return false
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
