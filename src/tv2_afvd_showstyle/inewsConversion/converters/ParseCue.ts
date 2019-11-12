export type UnparsedCue = string[] | null

export enum CueType {
	Unknown,
	Ignored_MOS, // Cues intentionally ignored - not required by Sofie
	Grafik,
	MOS,
	Ekstern,
	DVE,
	Telefon,
	VIZ,
	Mic,
	AdLib,
	LYD,
	Jingle,
	Design,
	Profile
}

export interface CueTime {
	frames?: number
	seconds?: number
	infiniteMode?: 'B' | 'S' | 'O'
}

export interface CueDefinitionBase {
	type: CueType
	start?: CueTime
	end?: CueTime
	adlib?: boolean
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
	cue: string
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

export interface DVESources {
	INP1?: string
	INP2?: string
	INP3?: string
	INP4?: string
}

export interface CueDefinitionDVE extends CueDefinitionBase {
	type: CueType.DVE
	template: string
	sources: DVESources
	labels: string[]
}

export interface CueDefinitionTelefon extends CueDefinitionBase {
	type: CueType.Telefon
	source: string
	vizObj?: CueDefinitionGrafik | CueDefinitionMOS
}

export interface CueDefinitionVIZ extends CueDefinitionBase {
	type: CueType.VIZ
	rawType: string
	content: {
		[key: string]: string
	}
	design: string
}

export interface CueDefinitionMic extends CueDefinitionBase {
	type: CueType.Mic
	mics: {
		[key: string]: boolean
	}
}

export interface CueDefinitionAdLib extends CueDefinitionBase {
	type: CueType.AdLib
	variant: string
	inputs: DVESources
	bynavn?: string
}

export interface CueDefinitionLYD extends CueDefinitionBase {
	type: CueType.LYD
	variant: string
}

export interface CueDefinitionJingle extends CueDefinitionBase {
	type: CueType.Jingle
	clip: string
}

export interface CueDefinitionDesign extends CueDefinitionBase {
	type: CueType.Design
	design: string
}

export interface CueDefinitionProfile extends CueDefinitionBase {
	type: CueType.Profile
	profile: string
}

export type CueDefinition =
	| CueDefinitionUnknown
	| CueDefinitionIgnoredMOS
	| CueDefinitionGrafik
	| CueDefinitionMOS
	| CueDefinitionEkstern
	| CueDefinitionDVE
	| CueDefinitionTelefon
	| CueDefinitionVIZ
	| CueDefinitionMic
	| CueDefinitionAdLib
	| CueDefinitionLYD
	| CueDefinitionJingle
	| CueDefinitionDesign
	| CueDefinitionProfile

export function ParseCue(cue: UnparsedCue): CueDefinition {
	if (!cue || cue.length === 0) {
		return {
			type: CueType.Unknown
		}
	}

	cue = cue.filter(c => c !== '')

	if (cue[0].match(/^kg ovl-all-out$/)) {
		// All out
		// TODO: STOP IGNORING MAYBE!
		return {
			type: CueType.Ignored_MOS,
			command: cue
		}
	} else if (cue[0].match(/(?:^[*|#]?kg[ |=])|(?:^digi)/i)) {
		// kg (Grafik)
		return parsekg(cue)
	} else if (cue[0].match(/ss=/i)) {
		return parseSS(cue)
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
	} else if (cue[0].match(/^VIZ=/)) {
		return parseVIZCues(cue)
	} else if (cue[0].match(/^STUDIE=MIC ON OFF$/)) {
		return parseMic(cue)
	} else if (cue[0].match(/^ADLIBPIX=/)) {
		return parseAdLib(cue)
	} else if (cue[0].match(/^KOMMANDO=/)) {
		return parseKommando(cue)
	} else if (cue[0].match(/^LYD=/)) {
		return parseLYD(cue)
	} else if (cue[0].match(/^JINGLE\d+=/)) {
		return parseJingle(cue)
	}
	return {
		type: CueType.Unknown
	}
}

function parsekg(cue: string[]): CueDefinitionGrafik {
	let kgCue: CueDefinitionGrafik = {
		type: CueType.Grafik,
		template: '',
		cue: '',
		textFields: []
	}

	const firstLineValues = cue[0].match(/^[*|#]?kg[ |=]([\w|\d]+)( (.+))*$/i)
	if (firstLineValues) {
		kgCue.cue = cue[0].match(/kg/) ? 'kg' : 'KG'
		kgCue.template = firstLineValues[1]
		if (firstLineValues[3]) {
			kgCue.textFields.push(firstLineValues[3])
		}
	} else if (cue[0].match(/^DIGI=/)) {
		kgCue.cue = 'DIGI'
		const templateType = cue[0].match(/^DIGI=(.+)$/)
		if (templateType) {
			kgCue.template = templateType[1]
		}
	}

	let textFields = cue.length - 1
	if (isTime(cue[cue.length - 1])) {
		kgCue = { ...kgCue, ...parseTime(cue[cue.length - 1]) }
	} else if (!cue[cue.length - 1].match(/;x.xx/)) {
		textFields += 1
	} else {
		kgCue.adlib = true
	}

	for (let i = 1; i < textFields; i++) {
		kgCue.textFields.push(cue[i])
	}

	if (!kgCue.start) {
		kgCue.adlib = true
	}

	return kgCue
}

function parseSS(cue: string[]): CueDefinitionUnknown {
	// TODO: Studio screen
	let ssCue: CueDefinitionUnknown = {
		type: CueType.Unknown
	}
	cue.forEach(line => {
		if (isTime(line)) {
			ssCue = { ...ssCue, ...parseTime(line) }
		}
	})
	return ssCue
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
		const continueCount = cue[4].match(/^ContinueCount=(-?\d+)$/i)
		const timing = cue[2].match(/L\|(M|;\d{1,2}(?:\.\d{1,2}){0,2})\|([SBO])$/)

		if (vcpid && continueCount) {
			mosCue = {
				type: CueType.MOS,
				name: cue[2],
				vcpid: Number(vcpid[1]),
				continueCount: Number(continueCount[1])
			}

			if (timing) {
				if (isTime(timing[1])) {
					mosCue.start = parseTime(timing[1]).start
				} else if (timing[1] === 'M') {
					mosCue.adlib = true
				}

				if (timing[2].match(/[SBO]/)) {
					mosCue.end = {
						infiniteMode: timing[2] as keyof { B: any; S: any; O: any }
					}
				}
			}
		}
	}
	return mosCue
}

function parseDVE(cue: string[]): CueDefinitionDVE {
	let dvecue: CueDefinitionDVE = {
		type: CueType.DVE,
		template: '',
		sources: {},
		labels: []
	}

	cue.forEach(c => {
		if (c.match(/^DVE=/)) {
			const template = c.match(/^DVE=(.+)$/)
			if (template) {
				dvecue.template = template[1]
			}
		} else if (c.match(/^INP\d+=/)) {
			const input = c.match(/^(INP\d)+=(.+)$/)
			if (input && input[1] && input[2]) {
				dvecue.sources[input[1] as keyof DVESources] = input[2]
			}
		} else if (c.match(/^BYNAVN=/)) {
			const labels = c.match(/^BYNAVN=(.+)$/)
			if (labels) {
				dvecue.labels = labels[1].split(/\/|\\/)
			}
		} else if (isTime(c)) {
			dvecue = { ...dvecue, ...parseTime(c) }
		}
	})

	return dvecue
}

function parseTelefon(cue: string[]): CueDefinitionTelefon {
	const telefonCue: CueDefinitionTelefon = {
		type: CueType.Telefon,
		source: ''
	}
	const source = cue[0].match(/^TELEFON=(.+)$/)
	if (source) {
		telefonCue.source = source[1]
	}

	if (cue.length > 1) {
		// tslint:disable-next-line:prefer-conditional-expression
		if (cue[1].match(/(?:^[*|#]?kg[ |=])|(?:^digi)/i)) {
			telefonCue.vizObj = parsekg(cue.slice(1, cue.length))
		} else {
			telefonCue.vizObj = parseMOS(cue.slice(1, cue.length))
		}
	}

	return telefonCue
}

function parseVIZCues(cue: string[]): CueDefinitionVIZ {
	let vizCues: CueDefinitionVIZ = {
		type: CueType.VIZ,
		rawType: cue[0],
		content: {},
		design: ''
	}

	const design = cue[0].match(/^VIZ=(.*)$/)
	if (design) {
		vizCues.design = design[1]
	}

	for (let i = 1; i < cue.length; i++) {
		if (isTime(cue[i])) {
			vizCues = { ...vizCues, ...parseTime(cue[i]) }
		} else {
			const c = cue[i].split('=')
			vizCues.content[c[0].toString()] = c[1]
		}
	}

	return vizCues
}

function parseMic(cue: string[]): CueDefinitionMic {
	let micCue: CueDefinitionMic = {
		type: CueType.Mic,
		mics: {}
	}
	cue.forEach(c => {
		if (!c.match(/^STUDIE=MIC ON OFF$/)) {
			if (isTime(c)) {
				micCue = { ...micCue, ...parseTime(c) }
			} else {
				const micState = c.match(/^(.+)=((?:ON)|(?:OFF))?$/)
				if (micState) {
					micCue.mics[micState[1].toString()] = micState[2] ? micState[2] === 'ON' : false
				}
			}
		}
	})

	return micCue
}

function parseAdLib(cue: string[]) {
	const adlib: CueDefinitionAdLib = {
		type: CueType.AdLib,
		variant: '',
		inputs: {}
	}

	const variant = cue[0].match(/^ADLIBPIX=(.+)$/)
	if (variant) {
		adlib.variant = variant[1]
	}

	if (cue[1]) {
		const input = cue[1].match(/^(INP\d)+=(.+)$/)
		if (input && input[1] && input[2] && adlib.inputs !== undefined) {
			adlib.inputs[input[1] as keyof DVESources] = input[2]
		}
	}

	if (cue[2]) {
		const bynavn = cue[2].match(/^BYNAVN=(.)$/)
		if (bynavn) {
			adlib.bynavn = bynavn[1]
		}
	}

	return adlib
}

function parseKommando(cue: string[]) {
	let kommandoCue: CueDefinitionProfile = {
		type: CueType.Profile,
		profile: ''
	}

	if (cue[1]) {
		kommandoCue.profile = cue[1]
	}

	if (cue[2] && isTime(cue[2])) {
		kommandoCue = { ...kommandoCue, ...parseTime(cue[2]) }
	}

	return kommandoCue
}

function parseLYD(cue: string[]) {
	let lydCue: CueDefinitionLYD = {
		type: CueType.LYD,
		variant: ''
	}

	const command = cue[0].match(/^LYD=(.*)$/)
	if (command) {
		lydCue.variant = command[1]
	}

	if (isTime(cue[1])) {
		lydCue = { ...lydCue, ...parseTime(cue[1]) }
	}

	return lydCue
}

function parseJingle(cue: string[]) {
	const jingleCue: CueDefinitionJingle = {
		type: CueType.Jingle,
		clip: ''
	}
	const clip = cue[0].match(/^JINGLE\d+=(.*)$/)
	if (clip && clip[1]) {
		jingleCue.clip = clip[1]
	}

	return jingleCue
}

export function isTime(line: string) {
	return !!line
		.replace(/\s+/g, '')
		.match(/^;\d{1,2}(?:(?:\.\d{1,2}){0,1}){0,2}(?:(?:-\d{1,2}(?:(?:\.\d{1,2}){0,1}){0,2}){0,1}|(?:-[BSO]))$/)
}

export function parseTime(line: string): Pick<CueDefinitionBase, 'start' | 'end'> {
	const retTime: any = {
		start: {},
		end: {}
	}
	const startAndEnd = line.split('-')
	startAndEnd[0] = startAndEnd[0].replace(';', '')
	startAndEnd.forEach((time, i) => {
		time = time.replace(/\s+/g, '')
		const field = i === 0 ? 'start' : 'end'
		if (time.match(/^[BSO]$/) && i !== 0) {
			retTime[field].infiniteMode = time
		} else {
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
