import * as _ from 'underscore'

import { ConfigMap, DefaultStudioConfig, DefaultShowStyleConfig } from './configs'
import { IngestRundown, IBlueprintRundownDB, IngestSegment, IngestPart } from 'tv-automation-sofie-blueprints-integration'
import { checkAllLayers } from './layers-check'

// @ts-ignore
global.VERSION = 'test'
// @ts-ignore
global.VERSION_TSR = 'test'
// @ts-ignore
global.VERSION_INTEGRATION = 'test'
import Blueprints from '../index'
import { ShowStyleContext, SegmentContext } from '../../__mocks__/context'
import { literal } from '../../common/util'

// More ROs can be listed here to make them part of the basic blueprint doesnt crash test
const rundowns: { ro: string, studioConfig: ConfigMap, showStyleConfig: ConfigMap }[] = [
	{ ro: '../../../rundowns/example.json', studioConfig: DefaultStudioConfig, showStyleConfig: DefaultShowStyleConfig }
]

describe('Rundown exceptions', () => {
	for (let roSpec of rundowns) {
		const roData = require(roSpec.ro)
		test('Valid file: ' + roSpec.ro, () => {
			expect(roData).toBeTruthy()
			// expect(roData.type).toEqual('runningOrderCache')
		})

		const ingressRo = literal<IngestRundown>({
			externalId: roData.id,
			name: roData.name,
			type: 'mock',
			segments: []
		})

		// TODO - rewrite all with less mangled source data

		const mockShowContext = new ShowStyleContext(ingressRo.name)
		mockShowContext.studioConfig = roSpec.studioConfig
		mockShowContext.showStyleConfig = roSpec.showStyleConfig
		const roRes = Blueprints.getRundown(mockShowContext, ingressRo)
		expect(roRes).toBeTruthy()

		const rundown = literal<IBlueprintRundownDB>({
			...roRes.rundown,
			_id: 'mockRo',
			showStyleVariantId: 'mockVariant'
		})

		for (const sectionId of _.keys(roData.sections)) {
			const mockContext = new SegmentContext(rundown, ingressRo.name)
			mockContext.studioConfig = roSpec.studioConfig
			mockContext.showStyleConfig = roSpec.showStyleConfig

			const section = roData.sections[sectionId]
			const segment = literal<IngestSegment>({
				externalId: section.id,
				name: section.name,
				rank: 0, // TODO
				parts: [],
				payload: section
			})

			test('Rundown story: ' + ingressRo.name + ' - ' + segment.name, async () => {
				for (const storyId of _.keys(section.stories || {})) {
					const story = section.stories[storyId]

					segment.parts.push(literal<IngestPart>({
						externalId: story.id,
						name: story.name,
						rank: 0, // TODO
						payload: story
					}))
				}

				const res = Blueprints.getSegment(mockContext, segment)
				expect(res.parts).toHaveLength(segment.parts.length) // This may change in future?
				_.each(res.parts, p => {
					checkAllLayers(mockContext, p.pieces)
					checkAllLayers(mockContext, p.adLibPieces)
				})

				// ensure there were no warnings
				expect(mockContext.getNotes()).toEqual([])
			})
		}
	}
})
