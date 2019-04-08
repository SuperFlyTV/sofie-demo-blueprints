import * as _ from 'underscore'

import {
	IBlueprintRunningOrder,
	IMessageBlueprintSegmentLine
} from 'tv-automation-sofie-blueprints-integration'
import {
	getHash, SegmentLineContext
} from '../../__mocks__/context'
import { ConfigMap } from './configs'
import { checkAllLayers } from './layers-check'

// @ts-ignore
global.VERSION = 'test'
// @ts-ignore
global.VERSION_TSR = 'test'
// @ts-ignore
global.VERSION_INTEGRATION = 'test'
import Blueprints from '../index'

// More ROs can be listed here to make them part of the basic blueprint doesnt crash test
const rundowns: { ro: string, studioConfig: ConfigMap, showStyleConfig: ConfigMap }[] = [
	// { ro: '../../../rundowns/mock3.json', studioConfig: DefaultStudioConfig, showStyleConfig: DefaultShowStyleConfig }
]

describe('Rundown exceptions', () => {
	for (let roSpec of rundowns) {
		const roData = require(roSpec.ro)
		test('Valid file: ' + roSpec.ro, () => {
			expect(roData).toBeTruthy()
			expect(roData.type).toEqual('runningOrderCache')
		})

		if (roData && roData.type && roData.type === 'runningOrderCache') {
			let roCreate = roData.data.find((d: any) => d.type === 'roCreate')
			test('Complete file: ' + roSpec.ro, () => {
				expect(roCreate).toBeTruthy()
			})

			// Create a dummy running order
			const runningOrder: IBlueprintRunningOrder = {
				_id: 'abc',
				name: 'Mock RO',
				showStyleVariantId: 'variant0'
			}

			// Create list of segmentlines with minimal data
			const segmentLines: IMessageBlueprintSegmentLine[] = []
			if (roCreate && roCreate.data && roCreate.data.Stories) {
				for (let story of roCreate.data.Stories) {
					segmentLines.push({
						_id: getHash(story.ID),
						slug: story.Slug || '??',
						typeVariant: '',
						mosId: story.ID,
						segmentId: ''
					})
				}
			}

			for (let story of roData.data) {
				if (story.type !== 'fullStory') continue

				let id = story._id
				if (story.data && story.data.Slug) id = story.data.Slug

				test('Rundown story: ' + roSpec.ro + ' - ' + id, async () => {
					// Ensure the story was defined in the ro
					expect(story.data.ID).toBeTruthy()
					const idHash = getHash(story.data.ID)
					const segmentLine = segmentLines.find((l: IMessageBlueprintSegmentLine) => l._id === idHash) as IMessageBlueprintSegmentLine
					expect(segmentLine).toBeTruthy()

					// Create a context
					const mockContext = new SegmentLineContext(runningOrder, segmentLine)
					mockContext.mockSegmentLines = segmentLines
					// mockContext.runtimeArguments = {}
					mockContext.studioConfig = roSpec.studioConfig
					mockContext.showStyleConfig = roSpec.showStyleConfig

					const res = Blueprints.getSegmentLine(mockContext, story.data)

					// Ensure some result was returned
					expect(res).not.toBeNull()
					if (res !== null) {
						expect(res.segmentLine).not.toBeNull()
						expect(res.segmentLineItems).not.toHaveLength(0)

						checkAllLayers(mockContext, res.segmentLineItems)
					}

					// ensure there were no warnings
					expect(mockContext.getNotes()).toEqual([])
				})
			}
		}
	}
})
