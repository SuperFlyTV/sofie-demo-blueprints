import { IngestSegment } from 'tv-automation-sofie-blueprints-integration'

export type UnparsedCue = string[]

export enum PartType {
	Unknown,
	Kam,
	Server,
	VO,
	Live
}

export interface INewsStory {
	fields: { [key: string]: string }
	meta: { [key: string]: string }
	cues: Array<UnparsedCue | null>
	id: string
	body: string
}

export interface INewsIngestSegment extends IngestSegment {
	payload: {
		rundownId: string
		iNewsStory: INewsStory
		float: boolean

		// TODO - remove the below
		externalId: string
		rank: number
		name: string
	}
}

export interface PartDefinition {
	externalId: string
	type: PartType
	rawType: string
	variant: { [key: string]: any }
	cues: UnparsedCue[]
	script: string
}

export function ParseBody(ingestSegment: INewsIngestSegment): PartDefinition[] {
	const iNewsStory = ingestSegment.payload.iNewsStory

	const definitions: PartDefinition[] = []
	let definition: PartDefinition = {
		externalId: '',
		type: PartType.Unknown,
		rawType: '',
		variant: {},
		cues: [],
		script: ''
	}
	let definitionIsValid = false
	let lines = iNewsStory.body.split('\r\n')

	for (let i = 0; i < lines.length; i++) {
		lines[i] = lines[i].replace(/<cc>(.*?)<\/cc>/g, '')
	}
	lines = lines.filter(line => line !== '<p></p>')

	lines.forEach(line => {
		const type = line.match(/<pi>(.*?)<\/pi>/)
		if (type) {
			if (definitionIsValid) {
				definitions.push(definition)
			}

			definitionIsValid = true
			const typeStr = type[1]
				.replace(/[^\w\s]*/g, '')
				.replace(/[\s]+/, ' ')
				.trim()

			definition = matchType(ingestSegment.externalId, definitions.length, typeStr)
			return
		}

		// TODO - multiple cues on one line, maybe with script?
		const cue = line.match(/<a idref="(\d+)">/)
		if (cue) {
			const realCue = iNewsStory.cues[Number(cue[1])]
			if (realCue) {
				definition.cues.push(realCue)
			}
			return
		}

		const script = line.match(/<p>(.*)?<\/p>/)
		if (script) {
			const trimscript = script[1].trim()
			if (trimscript) {
				definition.script += `${trimscript}\n`
			}
		}
	})
	if (definitionIsValid) {
		definitions.push(definition)
	}

	return definitions
}

function matchType(segmentId: string, i: number, typeStr: string): PartDefinition {
	const part: PartDefinition = {
		externalId: `${segmentId}-${i}`, // TODO - this should be something that sticks when inserting a part before the current part
		type: PartType.Unknown,
		rawType: typeStr,
		variant: {},
		cues: [],
		script: ''
	}

	const tokens = typeStr.split(' ')
	const firstToken = tokens[0].toLowerCase()

	if (firstToken === 'kam' /* || ..... */) {
		part.type = PartType.Kam
		part.variant.number = tokens[1]
	}

	return part
}
