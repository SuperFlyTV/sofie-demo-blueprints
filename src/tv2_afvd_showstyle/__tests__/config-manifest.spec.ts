import * as _ from 'underscore'
import { CoreInjectedKeys, ShowStyleConfigManifest, StudioConfigManifest } from '../config-manifests'
import { ShowStyleConfig, StudioConfig } from '../helpers/config'

const blankShowStyleConfig: ShowStyleConfig = {}

const blankStudioConfig: StudioConfig = {
	SofieHostURL: '',

	MediaFlowId: '',
	SourcesCam: '',
	SourcesRM: '',
	HyperdeckCount: 0,

	AtemSource: {
		DSK1F: 0,
		DSK1K: 0,
		DSK2F: 0,
		DSK2K: 0,
		Server1: 0,
		Server1Next: 0,
		Server2: 0,
		Server3: 0,
		SplitArtF: 0,
		SplitArtK: 0,
		Default: 0
	},

	LawoFadeInDuration: 0,
	CasparOutputDelay: 0
}

function getObjectKeys(obj: any): string[] {
	const definedKeys: string[] = []
	const processObj = (prefix: string, obj: any) => {
		_.each(_.keys(obj), k => {
			if (_.isObject(obj[k])) {
				processObj(prefix + k + '.', obj[k])
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
		const studioManifestKeys = _.map(StudioConfigManifest, e => e.id)
		const manifestKeys = studioManifestKeys.concat(CoreInjectedKeys).sort()

		const definedKeys = getObjectKeys(blankStudioConfig)

		expect(manifestKeys).toEqual(definedKeys.sort())
	})
	test('Exposed ShowStyle Keys', () => {
		const manifestKeys = _.map(ShowStyleConfigManifest, e => e.id).sort()

		const definedKeys = getObjectKeys(blankShowStyleConfig)

		expect(manifestKeys).toEqual(definedKeys.sort())
	})
})
