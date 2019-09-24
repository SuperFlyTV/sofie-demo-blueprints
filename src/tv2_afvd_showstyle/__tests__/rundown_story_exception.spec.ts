import * as _ from 'underscore'

import {
	IBlueprintPieceGeneric,
	IBlueprintRundownDB,
	IngestPart,
	IngestRundown
} from 'tv-automation-sofie-blueprints-integration'
import { ConfigMap, DefaultShowStyleConfig, DefaultStudioConfig } from './configs'
import { checkAllLayers } from './layers-check'

// @ts-ignore
global.VERSION = 'test'
// @ts-ignore
global.VERSION_TSR = 'test'
// @ts-ignore
global.VERSION_INTEGRATION = 'test'
import { SegmentContext, ShowStyleContext } from '../../__mocks__/context'
import { literal } from '../../common/util'
import Blueprints from '../index'
import { SplitStoryDataToParts } from '../inewsConversion/converters/SplitStoryDataToParts'

// More ROs can be listed here to make them part of the basic blueprint doesnt crash test
const rundowns: Array<{ ro: string; studioConfig: ConfigMap; showStyleConfig: ConfigMap }> = [
	{ ro: '../../../rundowns/example.json', studioConfig: DefaultStudioConfig, showStyleConfig: DefaultShowStyleConfig }
]

describe('Rundown exceptions', () => {
	for (const roSpec of rundowns) {
		const roData = require(roSpec.ro) as IngestRundown
		test('Valid file: ' + roSpec.ro, () => {
			expect(roData).toBeTruthy()
			expect(roData.externalId).toBeTruthy()
			expect(roData.type).toEqual('inews')
		})

		const showStyleContext = new ShowStyleContext('mockRo')
		const blueprintRundown = Blueprints.getRundown(showStyleContext, roData)
		const rundown = literal<IBlueprintRundownDB>({
			...blueprintRundown.rundown,
			_id: 'mockRo',
			showStyleVariantId: 'mock'
		})

		for (const segment of roData.segments) {
			test('Rundown segment: ' + roSpec.ro + ' - ' + rundown.externalId, async () => {
				const mockContext = new SegmentContext(rundown)
				mockContext.studioConfig = roSpec.studioConfig
				mockContext.showStyleConfig = roSpec.showStyleConfig

				const res = Blueprints.getSegment(mockContext, segment)
				expect(res.segment.name).toEqual(segment.name)
				const { allParts } = SplitStoryDataToParts.convert(segment.payload.iNewsStory)
				const ingestParts: IngestPart[] = allParts.map((part: any) => {
					return {
						externalId: part.data.id,
						name: part.data.name,
						rank: 0,
						payload: part.data
					}
				})
				let floated = 0
				ingestParts.forEach(part => {
					if (part.payload.float === 'true') {
						floated++
					}
				})
				expect(res.parts.length).toEqual(ingestParts.length - floated)

				const allPieces: IBlueprintPieceGeneric[] = []
				_.each(res.parts, part => {
					allPieces.push(...part.pieces)
					allPieces.push(...part.adLibPieces)
				})

				checkAllLayers(mockContext, allPieces)

				// ensure there were no warnings
				expect(mockContext.getNotes()).toEqual([])
			})
		}
	}
})
