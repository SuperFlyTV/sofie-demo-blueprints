import { BodyCodes } from './BodyCodesToJS'

import {
	ManusTypeServer,
	ManusTypeEmpty,
	ManusTypeKam,
	ManusTypeRemote,
	ManusTypeVO,
	ELEMENT_CODE_TYPES
} from '../manusConverters/ManusIndex'

export class SplitStoryDataToParts {

	static convert (story: any): any {
		let allParts: any[] = []

		let { elementCodes: segmentCodes, script } = BodyCodes.extract(story.body)

		segmentCodes.forEach((code: string, index: number) => {
			for (let type of ELEMENT_CODE_TYPES) {
				if (code.includes(type.code)) {
					switch (type.type) {
						case 1:
							allParts.push(...ManusTypeKam.convert(story, script,index))
							break
						case 2:
							allParts.push(...ManusTypeServer.convert(story, script, index))
							break
						case 3:
							allParts.push(...ManusTypeVO.convert(story, 'VO type Not Implemented', index))
							break
						case 4:
							allParts.push(...ManusTypeRemote.convert(story, 'LIVE type Not Implemented', index))
							break
						default:
							allParts.push(...ManusTypeEmpty.convert(story, 'Unknown Manus Type', index))
					}
					break
				}
			}
		})
		if (segmentCodes.length === 0) {
			allParts.push(...ManusTypeEmpty.convert(story, 'Manus Segment Not Implemented', 0))
		}

		return {
			allParts: allParts
		}
	}
}
