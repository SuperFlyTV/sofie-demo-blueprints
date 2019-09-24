export class ManusTypeEmpty {
	public static convert(story: any, script: string, index: number): any[] {
		const elements: any[] = []

		elements.push({
			data: {
				id: story.id + 'camera' + index,
				name: story.fields.title,
				type: 'CAM',
				float: 'false',
				script,
				objectType: 'camera',
				duration: '10' /* audioTime, */,
				clipName: 'stringManusEmpty'
			}
		})

		return elements
	}
}
