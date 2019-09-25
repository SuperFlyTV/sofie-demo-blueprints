export type UnparsedCue = string[]

export interface PartDefinition {
	type: string
	cues: UnparsedCue[]
	script: string
}

export function ParseBody(body: string, _allCues: Array<UnparsedCue | null>): PartDefinition[] {
	const definitions: PartDefinition[] = []
	let definition: PartDefinition = {
		type: '',
		cues: [],
		script: ''
	}
	let lines = body.split('\r\n')

	for (let i = 0; i < lines.length; i++) {
		lines[i] = lines[i].replace(/<cc>(.*?)<\/cc>/g, '')
	}
	lines = lines.filter(line => line !== '<p></p>')

	lines.forEach(line => {
		const type = line.match(/<pi>(.*?)<\/pi>/)
		if (type) {
			if (definition.type) {
				definitions.push(definition)
			}
			definition = {
				type: type[1]
					.replace(/[^\w\s]*/g, '')
					.replace(/[\s]+/, ' ')
					.trim(),
				cues: [],
				script: ''
			}
			return
		}

		const cue = line.match(/<a idref="(\d+)">/)
		if (cue) {
			const realCue = _allCues[Number(cue[1])]
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
	if (definition.type) {
		definitions.push(definition)
	}
	return definitions
}
