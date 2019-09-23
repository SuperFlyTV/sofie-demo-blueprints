
export class ManusTypeServer {

	static convert (story: any, script: string, index: number): any[] {
		console.log('DUMMY LOG :', script)

		let elements: any[] = []

		elements.push({
			data: {
				id: story.id + 'video' + index,
				name: story.fields.title,
				type: 'HEAD',
				float: 'false',
				script: '',
				objectType: 'video',
				duration: story.fields.tapeTime,
				clipName: story.fields.videoId
			}
		})

		return elements
	}
}
