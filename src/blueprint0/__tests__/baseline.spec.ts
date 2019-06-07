import { ShowStyleContext } from '../../__mocks__/context'
import { IngestRundown } from 'tv-automation-sofie-blueprints-integration'
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

			const rundown: IngestRundown = {
				externalId: 'abc',
				name: 'Mock RO',
				type: 'mock',
				payload: {},
				segments: []
			}

			const mockContext = new ShowStyleContext(rundown.name)
			mockContext.studioConfig = configSpec.studioConfig
			mockContext.showStyleConfig = configSpec.showStyleConfig

			const res = Blueprints.getRundown(mockContext, rundown)

			expect(res).not.toBeNull()
			expect(res.baseline).not.toHaveLength(0)
			expect(res.globalAdLibPieces).not.toHaveLength(0)

			checkAllLayers(mockContext, res.globalAdLibPieces, res.baseline)

			// ensure there were no warnings
			expect(mockContext.getNotes()).toEqual([])
		})
	}
})
