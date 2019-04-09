import { ShowStyleContext } from '../../__mocks__/context'
import { IngestRunningOrder } from 'tv-automation-sofie-blueprints-integration'
import { checkAllLayers } from './layers-check'

// @ts-ignore
global.VERSION = 'test'
// @ts-ignore
global.VERSION_TSR = 'test'
// @ts-ignore
global.VERSION_INTEGRATION = 'test'
import Blueprints from '../index'
import { DefaultStudioConfig, DefaultShowStyleConfig } from './configs'

const configs = [
	{ id: 'default', studioConfig: DefaultStudioConfig, showStyleConfig: DefaultShowStyleConfig }
]

describe('Baseline', () => {
	for (let configSpec of configs) {
		test('Config: ' + configSpec.id, () => {
			expect(configSpec.studioConfig).toBeTruthy()
			expect(configSpec.showStyleConfig).toBeTruthy()

			const runningOrder: IngestRunningOrder = {
				externalId: 'abc',
				name: 'Mock RO',
				type: 'mock',
				payload: {},
				segments: []
			}

			const mockContext = new ShowStyleContext(runningOrder.name)
			mockContext.studioConfig = configSpec.studioConfig
			mockContext.showStyleConfig = configSpec.showStyleConfig

			const res = Blueprints.getRunningOrder(mockContext, runningOrder)

			expect(res).not.toBeNull()
			expect(res.baseline).not.toHaveLength(0)
			expect(res.globalAdLibPieces).not.toHaveLength(0)

			checkAllLayers(mockContext, res.globalAdLibPieces, res.baseline)

			// ensure there were no warnings
			expect(mockContext.getNotes()).toEqual([])
		})
	}
})
