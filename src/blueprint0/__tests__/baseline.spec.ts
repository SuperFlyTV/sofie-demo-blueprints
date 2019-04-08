import { RunningOrderContext } from '../../__mocks__/context'
import { IBlueprintRunningOrder } from 'tv-automation-sofie-blueprints-integration'
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

			const runningOrder: IBlueprintRunningOrder = {
				_id: 'abc',
				name: 'Mock RO',
				showStyleVariantId: 'variant0'
			}

			const mockContext = new RunningOrderContext(runningOrder)
			mockContext.studioConfig = configSpec.studioConfig
			mockContext.showStyleConfig = configSpec.showStyleConfig

			const res = Blueprints.getBaseline(mockContext)

			expect(res).not.toBeNull()
			expect(res.baselineItems).not.toHaveLength(0)
			expect(res.adLibItems).not.toHaveLength(0)

			checkAllLayers(mockContext, res.adLibItems, res.baselineItems)

			// ensure there were no warnings
			expect(mockContext.getNotes()).toEqual([])
		})
	}
})
