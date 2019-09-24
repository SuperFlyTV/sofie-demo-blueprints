import * as _ from 'underscore'
import { showStyleConfigManifest } from '../config-manifests'
import { ShowStyleConfig } from '../helpers/config'

const blankShowStyleConfig: ShowStyleConfig = {}

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
	test('Exposed ShowStyle Keys', () => {
		const manifestKeys = _.map(showStyleConfigManifest, e => e.id).sort()

		const definedKeys = getObjectKeys(blankShowStyleConfig)

		expect(manifestKeys).toEqual(definedKeys.sort())
	})
})
