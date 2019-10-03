import { IngestSegment } from 'tv-automation-sofie-blueprints-integration'
import { UnparsedCue } from './ParseCue'

export enum PartType {
	Unknown,
	Kam,
	Server,
	VO,
	Live,
	Teknik,
	Grafik
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
	cues: UnparsedCue[]
	script: string
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

export type PartDefinition =
	| PartDefinitionUnknown
	| PartDefinitionKam
	| PartDefinitionServer
	| PartDefinitionTeknik
	| PartDefinitionLive
	| PartDefinitionGrafik
	| PartDefinitionVO
export type PartdefinitionTypes =
	| Pick<PartDefinitionUnknown, 'type' | 'variant'>
	| Pick<PartDefinitionKam, 'type' | 'variant'>
	| Pick<PartDefinitionServer, 'type' | 'variant'>
	| Pick<PartDefinitionTeknik, 'type' | 'variant'>
	| Pick<PartDefinitionLive, 'type' | 'variant'>
	| Pick<PartDefinitionGrafik, 'type' | 'variant'>
	| Pick<PartDefinitionVO, 'type' | 'variant'>

export function ParseBody(segmentId: string, body: string, cues: UnparsedCue[]): PartDefinition[] {
	const definitions: PartDefinition[] = []
	let definition: PartDefinition = {
		externalId: '',
		type: PartType.Unknown,
		rawType: '',
		variant: {},
		cues: [],
		script: ''
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
				if (!typeStr.match(/\b(KAM|CAM|KAMERA|CAMERA|SERVER|TEKNIK|LIVE|GRAFIK|VO)+\b/gi)) {
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

						definition = makeDefinition(segmentId, definitions.length, typeStr)
					}
					return
				}
				if (definition.rawType) {
					definitions.push(definition)
				}

				definition = makeDefinition(segmentId, definitions.length, typeStr)

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
					definition.cues.push(realCue)
				}
			}
		})
	}
}

function makeDefinition(segmentId: string, i: number, typeStr: string): PartDefinition {
	const part: PartDefinition = {
		externalId: `${segmentId}-${i}`, // TODO - this should be something that sticks when inserting a part before the current part
		...extractTypeProperties(typeStr),
		rawType: typeStr,
		cues: [],
		script: ''
	}

	return part
}

function extractTypeProperties(typeStr: string): PartdefinitionTypes {
	const tokens = typeStr.split(' ')
	const firstToken = tokens[0]

	if (firstToken.match(/KAM|CAM/)) {
		return {
			type: PartType.Kam,
			variant: {
				name: tokens[1]
			}
		}
	} else if (firstToken.match(/SERVER/)) {
		return {
			type: PartType.Server,
			variant: {}
		}
	} else if (firstToken.match(/TEKNIK/)) {
		return {
			type: PartType.Teknik,
			variant: {}
		}
	} else if (firstToken.match(/LIVE/)) {
		return {
			type: PartType.Live,
			variant: {}
		}
	} else if (firstToken.match(/GRAFIK/)) {
		return {
			type: PartType.Grafik,
			variant: {}
		}
	} else if (firstToken.match(/VO/)) {
		return {
			type: PartType.VO,
			variant: {}
		}
	} else {
		return {
			type: PartType.Unknown,
			variant: {}
		}
	}
}
