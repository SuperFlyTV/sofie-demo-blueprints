import { IngestSegment } from 'tv-automation-sofie-blueprints-integration'

export type UnparsedCue = string[] | null

export enum PartType {
	Unknown,
	Kam,
	Server,
	VO,
	Live,
	Teknik,
	Slutord,
	Grafik,
	Attack,
	NEDLÆG,
	SB,
	STEP,
	KADA
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

export interface PartDefinitionSlutord extends PartDefinitionBase {
	type: PartType.Slutord
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

export interface PartDefinitionAttack extends PartDefinitionBase {
	type: PartType.Attack
	variant: {}
}

export interface PartDefinitionNEDLÆG extends PartDefinitionBase {
	type: PartType.NEDLÆG
	variant: {}
}

export interface PartDefinitionSB extends PartDefinitionBase {
	type: PartType.SB
	variant: {}
}

export interface PartDefinitionStep extends PartDefinitionBase {
	type: PartType.STEP
	variant: {}
}

export interface PartDefinitionKada extends PartDefinitionBase {
	type: PartType.KADA
	variant: {}
}

export type PartDefinition =
	| PartDefinitionUnknown
	| PartDefinitionKam
	| PartDefinitionServer
	| PartDefinitionTeknik
	| PartDefinitionLive
	| PartDefinitionSlutord
	| PartDefinitionGrafik
	| PartDefinitionVO
	| PartDefinitionAttack
	| PartDefinitionNEDLÆG
	| PartDefinitionSB
	| PartDefinitionStep
	| PartDefinitionKada
export type PartdefinitionTypes =
	| Pick<PartDefinitionUnknown, 'type' | 'variant'>
	| Pick<PartDefinitionKam, 'type' | 'variant'>
	| Pick<PartDefinitionServer, 'type' | 'variant'>
	| Pick<PartDefinitionTeknik, 'type' | 'variant'>
	| Pick<PartDefinitionLive, 'type' | 'variant'>
	| Pick<PartDefinitionSlutord, 'type' | 'variant'>
	| Pick<PartDefinitionGrafik, 'type' | 'variant'>
	| Pick<PartDefinitionVO, 'type' | 'variant'>
	| Pick<PartDefinitionAttack, 'type' | 'variant'>
	| Pick<PartDefinitionNEDLÆG, 'type' | 'variant'>
	| Pick<PartDefinitionSB, 'type' | 'variant'>
	| Pick<PartDefinitionStep, 'type' | 'variant'>
	| Pick<PartDefinitionKada, 'type' | 'variant'>

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
	let definitionIsValid = false
	let lines = body.split('\r\n')

	for (let i = 0; i < lines.length; i++) {
		lines[i] = lines[i].replace(/<cc>(.*?)<\/cc>/g, '')
	}
	lines = lines.filter(line => line !== '<p></p>')

	lines.forEach(line => {
		const type = line.match(/<pi>(.*?)<\/pi>/)

		if (type) {
			const typeStr = type[1]
				.replace(/[^\w\s]*\B[^\w\s]/g, '')
				.replace(/[\s]+/, ' ')
				.trim()

			if (typeStr) {
				if (!typeStr.match(/(KAM|CAM|SERVER|TEKNIK|SLUTORD|[S\s]lutord|LIVE|GRAFIK|VO|ATTACK|NEDLÆG|STEP|KADA|SB)+/g)) {
					const scriptBullet = line.match(/<p><pi>(.*)?<\/pi><\/p>/)
					if (scriptBullet) {
						const trimscript = scriptBullet[1].trim()
						if (trimscript) {
							definition.script += `${trimscript}\n`
						}
					}
					if (!typeStr.match(/.\w*\?/g)) {
						console.log(`This might contain a new type: ${typeStr}`)
					}
					return
				}
				if (definitionIsValid) {
					definitions.push(definition)
				}

				definitionIsValid = true

				definition = makeDefinition(segmentId, definitions.length, typeStr)
				return
			}
		}

		// TODO - multiple cues on one line, maybe with script?
		const cue = line.match(/<a idref="(\d+)">/)
		if (cue) {
			const realCue = cues[Number(cue[1])]
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
	} else if (firstToken.match(/SLUTORD/i)) {
		return {
			type: PartType.Slutord,
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
	} else if (firstToken.match(/ATTACK/)) {
		return {
			type: PartType.Attack,
			variant: {}
		}
	} else if (firstToken.match(/NEDLÆG/)) {
		return {
			type: PartType.NEDLÆG,
			variant: {}
		}
	} else if (firstToken.match(/STEP/)) {
		return {
			type: PartType.STEP,
			variant: {}
		}
	} else if (firstToken.match(/SB/)) {
		return {
			type: PartType.SB,
			variant: {}
		}
	} else if (firstToken.match(/KADA/)) {
		return {
			type: PartType.KADA,
			variant: {}
		}
	} else {
		return {
			type: PartType.Unknown,
			variant: {}
		}
	}
}
