import * as _ from 'underscore'

import { RealLLayers } from '../../tv2_afvd_studio/layers'
import MappingsDefaults from '../migrations/mappings-defaults'

describe('Migration Defaults', () => {
	test('MappingsDefaults', () => {
		const defaultsIds = _.map(MappingsDefaults, (v, id) => {
			v = v
			return id
		}).sort()

		// Inject core_abstract as it is required by core and so needs to be defined
		const layerIds = RealLLayers()
			.concat(['core_abstract'])
			.sort()

		expect(defaultsIds).toEqual(layerIds)
	})
})
