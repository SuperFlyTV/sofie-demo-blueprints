import * as _ from 'underscore'

import { MediaPlayerType } from '../config-manifests'
import { RealLLayers } from '../layers'
import MappingsDefaults, {
	getCameraSisyfosMappings,
	getMediaPlayerMappings,
	getRemoteSisyfosMappings
} from '../migrations/mappings-defaults'

describe('Migration Defaults', () => {
	test('MappingsDefaults', () => {
		const allMappings = {
			...MappingsDefaults,
			// Inject MediaPlayer ones, as they are used directly and part of the enum
			...getMediaPlayerMappings(MediaPlayerType.CasparAB, []),
			...getMediaPlayerMappings(MediaPlayerType.CasparWithNext, []),
			...getCameraSisyfosMappings(''),
			...getRemoteSisyfosMappings('')
		}
		const defaultsIds = _.map(allMappings, (v, id) => {
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
