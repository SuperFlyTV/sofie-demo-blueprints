interface IBodyCodes {
	elementCodes: string[]
	script: string
}

export class BodyCodes {
	public static extract(bodyString: string): IBodyCodes {
		const elementCodes: string[] = []

		// Split tags into objects:
		const bodyArray: string[] = bodyString.split('\n') || []

		let script = ''
		bodyArray.forEach((line: string) => {
			line = line.replace('<p>', '')
			line = line.replace('</p>', '')
			line = line.replace(/<a (.*?)>/, '')
			line = line.replace('</a>', '')

			if (!line.includes('<cc>')) {
				if (line.includes('<pi>')) {
					line = line.replace('<pi>', '')
					line = line.replace('</pi>', '')
					elementCodes.push(line)
				}
				script = script + line + '\n'
			}
		})

		return {
			elementCodes,
			script
		}
	}
}
