import * as _ from 'underscore'
import { CORE_INJECTED_KEYS, MediaPlayerType, studioConfigManifest } from '../config-manifests'
import { StudioConfig } from '../helpers/config'

const blankStudioConfig: StudioConfig = {
	SofieHostURL: '',

	MediaFlowId: '',
	SourcesCam: '',
	SourcesRM: '',
	SourcesSkype: '',
	HyperdeckCount: 0,
	ABMediaPlayers: '',
	MediaPlayerType: MediaPlayerType.CasparAB,

	AtemSource: {
		DSK1F: 0,
		DSK1K: 0,
		DSK2F: 0,
		DSK2K: 0,
		ServerC: 0,
		SplitArtF: 0,
		SplitArtK: 0,
		Default: 0
	},
	CasparOutputDelay: 0
}

function getObjectKeys(obj: any): string[] {
	const definedKeys: string[] = []
	const processObj = (prefix: string, o: any) => {
		_.each(_.keys(o), k => {
			if (_.isObject(o[k])) {
				processObj(prefix + k + '.', o[k])
			} else {
				definedKeys.push(prefix + k)
			}
		})
	}
	processObj('', obj)
	return definedKeys
}

describe('Config Manifest', () => {
	test('Exposed Studio Keys', () => {
		const studioManifestKeys = _.map(studioConfigManifest, e => e.id)
		const manifestKeys = studioManifestKeys.concat(CORE_INJECTED_KEYS).sort()

		const definedKeys = getObjectKeys(blankStudioConfig)

		expect(manifestKeys).toEqual(definedKeys.sort())
	})
})
