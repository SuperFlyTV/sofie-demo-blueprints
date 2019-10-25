import * as _ from 'underscore'
import { showStyleConfigManifest } from '../config-manifests'
import { ShowStyleConfig } from '../helpers/config'

const blankShowStyleConfig: ShowStyleConfig = {
	DVEStyles: [],
	GFXTemplates: [],
	DefaultTemplateDuration: 4,
	JingleTimings: ''
}

describe('Config Manifest', () => {
	test('Exposed ShowStyle Keys', () => {
		const showStyleManifestKeys = _.map(showStyleConfigManifest, e => e.id)
		const manifestKeys = showStyleManifestKeys.sort()

		const definedKeys = Object.keys(blankShowStyleConfig)

		expect(manifestKeys).toEqual(definedKeys.sort())
	})
})
