import * as _ from 'underscore'

import { RealLLayers, SourceLayer } from '../../types/layers'
import MappingsDefaults from '../migrations/mappings-defaults'
import SourcelayerDefaults from '../migrations/sourcelayer-defaults'

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

	test('SourcelayerDefaults', () => {
		const defaultsIds = _.map(SourcelayerDefaults, v => v._id).sort()
		const layerIds = _.values(SourceLayer).sort()

		expect(defaultsIds).toEqual(layerIds)
	})
})
