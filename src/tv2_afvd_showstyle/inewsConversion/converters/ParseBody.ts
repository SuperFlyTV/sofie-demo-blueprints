import { IngestSegment } from 'tv-automation-sofie-blueprints-integration'
import { CueDefinition, ParseCue, UnparsedCue } from './ParseCue'

export enum PartType {
	Unknown,
	Kam,
	Server,
	VO,
	Live,
	Teknik,
	Grafik,
	INTRO,
	Slutord
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

export interface PartDefinitionBase {
	externalId: string
	type: PartType
	rawType: string
	variant: {}
	effekt?: number
	cues: CueDefinition[]
	script: string
	fields: { [key: string]: string }
	modified: number
}

export interface PartDefinitionUnknown extends PartDefinitionBase {
	type: PartType.Unknown
	variant: {}
}

export interface PartDefinitionKam extends PartDefinitionBase {
	type: PartType.Kam
	variant: {
		name: string
	}
}

export interface PartDefinitionServer extends PartDefinitionBase {
	type: PartType.Server
	variant: {}
}

export interface PartDefinitionTeknik extends PartDefinitionBase {
	type: PartType.Teknik
	variant: {}
}

export interface PartDefinitionLive extends PartDefinitionBase {
	type: PartType.Live
	variant: {}
}

export interface PartDefinitionGrafik extends PartDefinitionBase {
	type: PartType.Grafik
	variant: {}
}

export interface PartDefinitionVO extends PartDefinitionBase {
	type: PartType.VO
	variant: {}
}

export interface PartDefinitionIntro extends PartDefinitionBase {
	type: PartType.INTRO
	variant: {}
}

export interface PartDefinitionSlutord extends PartDefinitionBase {
	type: PartType.Slutord
	variant: {
		endWords: string
	}
}

export type PartDefinition =
	| PartDefinitionUnknown
	| PartDefinitionKam
	| PartDefinitionServer
	| PartDefinitionTeknik
	| PartDefinitionLive
	| PartDefinitionGrafik
	| PartDefinitionVO
	| PartDefinitionIntro
	| PartDefinitionSlutord
export type PartdefinitionTypes =
	| Pick<PartDefinitionUnknown, 'type' | 'variant' | 'effekt'>
	| Pick<PartDefinitionKam, 'type' | 'variant' | 'effekt'>
	| Pick<PartDefinitionServer, 'type' | 'variant' | 'effekt'>
	| Pick<PartDefinitionTeknik, 'type' | 'variant' | 'effekt'>
	| Pick<PartDefinitionLive, 'type' | 'variant' | 'effekt'>
	| Pick<PartDefinitionGrafik, 'type' | 'variant' | 'effekt'>
	| Pick<PartDefinitionVO, 'type' | 'variant' | 'effekt'>
	| Pick<PartDefinitionIntro, 'type' | 'variant' | 'effekt'>
	| Pick<PartDefinitionSlutord, 'type' | 'variant' | 'effekt'>

export function ParseBody(
	segmentId: string,
	segmentName: string,
	body: string,
	cues: UnparsedCue[],
	fields: any,
	modified: number
): PartDefinition[] {
	const definitions: PartDefinition[] = []
	let definition: PartDefinition = {
		externalId: '',
		type: PartType.Unknown,
		rawType: '',
		variant: {},
		cues: [],
		script: '',
		fields,
		modified
	}

	if (segmentName === 'INTRO') {
		;((definition as unknown) as PartDefinitionIntro).type = PartType.INTRO
		cues.forEach(cue => {
			if (cue !== null) {
				definition.cues.push(ParseCue(cue))
			}
		})
		definition.rawType = 'INTRO'
		definition.externalId = `${segmentId}-${definitions.length}`
		definitions.push(definition)
		return definitions
	}

	let lines = body.split('\r\n')

	for (let i = 0; i < lines.length; i++) {
		lines[i] = lines[i].replace(/<cc>(.*?)<\/cc>/g, '')
	}
	lines = lines.filter(line => line !== '<p></p>' && line !== '<p><pi></pi></p>')

	lines.forEach(line => {
		const type = line.match(/<pi>(.*?)<\/pi>/)

		if (type) {
			const typeStr = type[1]
				.replace(/<[a-z]+>/g, '')
				.replace(/<\/[a-z]+>/g, '')
				.replace(/[^\w\s]*\B[^\w\s]/g, '')
				.replace(/[\s]+/, ' ')
				.trim()

			if (typeStr) {
				if (!typeStr.match(/\b(KAM|CAM|KAMERA|CAMERA|SERVER|TEKNIK|LIVE|GRAFIK|VO|SLUTORD)+\b/gi)) {
					// Live types have bullet points (usually questions to ask)
					if (definition.type === PartType.Live) {
						const scriptBullet = line.match(/<p><pi>(.*)?<\/pi><\/p>/)
						if (scriptBullet) {
							const trimscript = scriptBullet[1].trim()
							if (trimscript) {
								definition.script += `${trimscript}\n`
							}
						}
					} else {
						definition.externalId = `${segmentId}-${definitions.length}`
						definitions.push(definition)

						definition = makeDefinition(segmentId, definitions.length, typeStr, fields, modified)
					}
					return
				}
				if (definition.rawType || definition.cues.length || definition.script) {
					if (!definition.externalId) {
						definition.externalId = `${segmentId}-${definitions.length}`
					}
					definitions.push(definition)
				}

				definition = makeDefinition(segmentId, definitions.length, typeStr, fields, modified)

				// check for cues inline with the type definition
				addCue(definition, line, cues)

				return
			}
		}

		addCue(definition, line, cues)

		const script = line.match(/<p>(.*)?<\/p>/)
		if (script) {
			const trimscript = script[1]
				.replace(/<.*?>/g, '')
				.replace('\n\r', '')
				.trim()
			if (trimscript) {
				definition.script += `${trimscript}\n`
			}
		}
	})
	if (!definition.externalId) {
		definition.externalId = `${segmentId}-${definitions.length}`
	}
	definitions.push(definition)

	return definitions
}

function addCue(definition: PartDefinition, line: string, cues: UnparsedCue[]) {
	const cue = line.match(/<a idref=["|'](\d+)["|']>/g)
	if (cue) {
		cue.forEach(c => {
			const value = c.match(/<a idref=["|'](\d+)["|']>/)
			if (value) {
				const realCue = cues[Number(value[1])]
				if (realCue) {
					definition.cues.push(ParseCue(realCue))
				}
			}
		})
	}
}

function makeDefinition(segmentId: string, i: number, typeStr: string, fields: any, modified: number): PartDefinition {
	const part: PartDefinition = {
		externalId: `${segmentId}-${i}`, // TODO - this should be something that sticks when inserting a part before the current part
		...extractTypeProperties(typeStr),
		rawType: typeStr
			.replace(/effekt \d+/gi, '')
			.replace(/ /g, ' ')
			.trim(),
		cues: [],
		script: '',
		fields,
		modified
	}

	return part
}

function extractTypeProperties(typeStr: string): PartdefinitionTypes {
	const effektMatch = typeStr.match(/effekt (\d+)/i)
	const definition: Pick<PartdefinitionTypes, 'effekt'> = {}
	if (effektMatch) {
		definition.effekt = Number(effektMatch[1])
	}
	const tokens = typeStr
		.replace(/effekt (\d+)/gi, '')
		.replace(/ /g, ' ')
		.trim()
		.split(' ')
	const firstToken = tokens[0]

	if (firstToken.match(/KAM|CAM/)) {
		return {
			type: PartType.Kam,
			variant: {
				name: tokens[1]
			},
			...definition
		}
	} else if (firstToken.match(/SERVER/)) {
		return {
			type: PartType.Server,
			variant: {},
			...definition
		}
	} else if (firstToken.match(/TEKNIK/)) {
		return {
			type: PartType.Teknik,
			variant: {},
			...definition
		}
	} else if (firstToken.match(/LIVE/)) {
		return {
			type: PartType.Live,
			variant: {},
			...definition
		}
	} else if (firstToken.match(/GRAFIK/)) {
		return {
			type: PartType.Grafik,
			variant: {},
			...definition
		}
	} else if (firstToken.match(/VO/)) {
		return {
			type: PartType.VO,
			variant: {},
			...definition
		}
	} else if (firstToken.match(/SLUTORD/i)) {
		return {
			type: PartType.Slutord,
			variant: {
				endWords: tokens.slice(1, tokens.length).join(' ')
			},
			...definition
		}
	} else {
		return {
			type: PartType.Unknown,
			variant: {},
			...definition
		}
	}
}
