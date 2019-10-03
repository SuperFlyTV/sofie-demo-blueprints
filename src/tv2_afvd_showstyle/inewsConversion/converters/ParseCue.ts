export type UnparsedCue = string[] | null

export enum CueType {
	Unknown,
	Ignored_MOS, // Cues intentionally ignored - not required by Sofie
	Grafik,
	MOS,
	Ekstern,
	DVE,
	Telefon
}

export interface CueTime {
	frames?: number
	seconds?: number
}

export interface CueDefinitionBase {
	type: CueType
	start?: CueTime
	end?: CueTime
}

export interface CueDefinitionUnknown extends CueDefinitionBase {
	type: CueType.Unknown
}

export interface CueDefinitionIgnoredMOS extends CueDefinitionBase {
	type: CueType.Ignored_MOS
	command: UnparsedCue
}

export interface CueDefinitionGrafik extends CueDefinitionBase {
	type: CueType.Grafik
	template: string
	textFields: string[]
}

export interface CueDefinitionMOS extends CueDefinitionBase {
	type: CueType.MOS
	name: string
	vcpid: number
	continueCount: number
}

export interface CueDefinitionEkstern extends CueDefinitionBase {
	type: CueType.Ekstern
	source: string
}

export interface CueDefinitionDVE extends CueDefinitionBase {
	type: CueType.DVE
	template: string
	sources: string[]
	labels: string[]
}

export interface CueDefinitionTelefon extends CueDefinitionBase {
	type: CueType.Telefon
	source: string
	vizObj?: CueDefinitionGrafik
}

export type CueDefinition =
	| CueDefinitionUnknown
	| CueDefinitionIgnoredMOS
	| CueDefinitionGrafik
	| CueDefinitionMOS
	| CueDefinitionEkstern
	| CueDefinitionDVE
	| CueDefinitionTelefon

export function ParseCue(cue: UnparsedCue): CueDefinition {
	if (!cue) {
		return {
			type: CueType.Unknown
		}
	}

	if (cue[0].match(/^kg ovl-all-out$/)) {
		// All out
		return {
			type: CueType.Ignored_MOS,
			command: cue
		}
	} else if (cue[0].match(/^kg/i)) {
		// kg (Grafik)
		return parsekg(cue as string[])
	} else if (cue[0].match(/^]] [a-z]\d\.\d [a-z] \d \[\[$/i)) {
		// MOS
		return parseMOS(cue)
	} else if (cue[0].match(/^EKSTERN=/)) {
		// EKSTERN
		const eksternSource = cue[0].match(/^EKSTERN=(.+)$/)
		if (eksternSource) {
			return {
				type: CueType.Ekstern,
				source: eksternSource[1]
			}
		}
	} else if (cue[0].match(/^DVE=/)) {
		// DVE
		return parseDVE(cue)
	} else if (cue[0].match(/^TELEFON=/)) {
		// Telefon
		return parseTelefon(cue)
	}
	return {
		type: CueType.Unknown
	}
}

function parsekg(cue: string[]): CueDefinitionGrafik {
	let kgCue: CueDefinitionGrafik = {
		type: CueType.Grafik,
		template: '',
		textFields: []
	}

	const firstLineValues = cue[0].match(/^kg ([\w|\d]+)( (.+))*$/)
	if (firstLineValues) {
		kgCue.template = firstLineValues[1]
		if (firstLineValues[3]) {
			kgCue.textFields.push(firstLineValues[3])
		}

		let textFields = cue.length - 1
		if (isTime(cue[cue.length - 1])) {
			kgCue = { ...kgCue, ...parseTime(cue[cue.length - 1]) }
		} else {
			textFields += 1
		}

		for (let i = 1; i < textFields; i++) {
			kgCue.textFields.push(cue[i])
		}
	}

	return kgCue
}

function parseMOS(cue: string[]): CueDefinitionMOS {
	let mosCue: CueDefinitionMOS = {
		type: CueType.MOS,
		name: '',
		vcpid: -1,
		continueCount: -1
	}
	if (cue.length === 6) {
		const vcpid = cue[3].match(/^VCPID=(\d+)$/i)
		const continueCount = cue[4].match(/^ContinueCount=(\d+)$/i)

		if (vcpid && continueCount) {
			mosCue = {
				type: CueType.MOS,
				name: cue[2],
				vcpid: Number(vcpid[1]),
				continueCount: Number(continueCount[1])
			}
		}
	}
	return mosCue
}

function parseDVE(cue: string[]): CueDefinitionDVE {
	const dvecue: CueDefinitionDVE = {
		type: CueType.DVE,
		template: '',
		sources: [],
		labels: []
	}

	cue.forEach(c => {
		if (c.match(/^DVE=/)) {
			const template = c.match(/^DVE=(.+)$/)
			if (template) {
				dvecue.template = template[1]
			}
		} else if (c.match(/^INP\d+=/)) {
			const input = c.match(/^INP\d+=(.+)$/)
			if (input) {
				dvecue.sources.push(input[1])
			}
		} else if (c.match(/^BYNAVN=/)) {
			const labels = c.match(/^BYNAVN=(.+)$/)
			if (labels) {
				dvecue.labels = labels[1].split('/')
			}
		}
	})

	return dvecue
}

function parseTelefon(cue: string[]): CueDefinitionTelefon {
	const telefonCue: CueDefinitionTelefon = {
		type: CueType.Telefon,
		source: '',
		vizObj: parsekg(cue.slice(1, cue.length))
	}
	const source = cue[0].match(/^TELEFON=(.+)$/)
	if (source) {
		telefonCue.source = source[1]
	}

	return telefonCue
}

function isTime(line: string) {
	return line.match(/^;\d{1,2}(?:(?:\.\d{1,2}){0,1}){0,2}(?:-\d{1,2}(?:(?:\.\d{1,2}){0,1}){0,2}){0,1}$/)
}

function parseTime(line: string) {
	const retTime: any = {
		start: {},
		end: {}
	}
	const startAndEnd = line.split('-')
	startAndEnd[0] = startAndEnd[0].replace(';', '')
	startAndEnd.forEach((time, i) => {
		const field = i === 0 ? 'start' : 'end'
		const timeSegments = time.split('.')

		if (timeSegments[0]) {
			retTime[field].seconds = (Number(timeSegments[0]) || 0) * 60
		}

		if (timeSegments[1]) {
			retTime[field].seconds += Number(timeSegments[1].replace('.', '')) || 0
		}

		if (timeSegments[2]) {
			retTime[field].frames = Number(timeSegments[2].replace('.', '')) || 0
		}
	})

	if (!Object.keys(retTime.start).length) {
		retTime.start = undefined
	}

	if (!Object.keys(retTime.end).length) {
		retTime.end = undefined
	}

	return retTime
}
