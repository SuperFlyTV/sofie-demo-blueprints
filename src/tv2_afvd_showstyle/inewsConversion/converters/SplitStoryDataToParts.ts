// import { BodyCodes } from './BodyCodesToJS'

// import {
// 	ELEMENT_CODE_TYPES,
// 	ManusTypeEmpty,
// 	ManusTypeKam,
// 	ManusTypeRemote,
// 	ManusTypeServer,
// 	ManusTypeVO
// } from '../manusConverters/ManusIndex'

// export class SplitStoryDataToParts {
// 	public static convert(story: any): any {
// 		const allParts: any[] = []

// 		const { elementCodes: segmentCodes, script } = BodyCodes.extract(story.body)

// 		segmentCodes.forEach((code: string, index: number) => {
// 			for (const type of ELEMENT_CODE_TYPES) {
// 				if (code.includes(type.code)) {
// 					switch (type.type) {
// 						case 1:
// 							allParts.push(...ManusTypeKam.convert(story, script, index))
// 							break
// 						case 2:
// 							allParts.push(...ManusTypeServer.convert(story, script, index))
// 							break
// 						case 3:
// 							allParts.push(...ManusTypeVO.convert(story, 'VO type Not Implemented', index))
// 							break
// 						case 4:
// 							allParts.push(...ManusTypeRemote.convert(story, 'LIVE type Not Implemented', index))
// 							break
// 						default:
// 							allParts.push(...ManusTypeEmpty.convert(story, 'Unknown Manus Type', index))
// 					}
// 					break
// 				}
// 			}
// 		})
// 		if (segmentCodes.length === 0) {
// 			allParts.push(...ManusTypeEmpty.convert(story, 'Manus Segment Not Implemented', 0))
// 		}

// 		return {
// 			allParts
// 		}
// 	}
// }
