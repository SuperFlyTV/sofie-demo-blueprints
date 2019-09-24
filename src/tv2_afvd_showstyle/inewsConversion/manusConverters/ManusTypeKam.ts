export class ManusTypeKam {
	public static convert(story: any, script: string, index: number): any[] {
		const elements: any[] = []
		// Loop through .cues and look for #kg codes and add as pieces

		elements.push({
			data: {
				id: story.id + 'camera' + index,
				name: story.fields.title,
				type: 'CAM',
				float: 'false',
				script,
				objectType: 'camera',
				duration: story.fields.audioTime,
				clipName: 'string'
			}
		})

		return elements
	}
}
