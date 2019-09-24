import * as fs from 'fs'
import * as util from 'util'
import * as _ from 'underscore'
import { BlueprintManifestSet } from 'tv-automation-sofie-blueprints-integration'
const { BlueprintBundles } = require('./blueprint-map')

const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)

const webpackConfig = require('../config/webpack.config.js')
const sources = _.keys(webpackConfig().entry)

async function writeBundle(name: string, blueprints: BlueprintManifestSet) {
	const manifestStr = JSON.stringify(blueprints, undefined, 4)
	await writeFile(`dist/bundle${name ? '-' + name : ''}.json`, manifestStr)
}

;(async () => {
	const blueprints: BlueprintManifestSet = {}
	for (const s of sources) {
		blueprints[s] = (await readFile(`dist/${s}-bundle.js`)).toString()
	}

	writeBundle('', blueprints)

	for (const id of _.keys(BlueprintBundles)) {
		writeBundle(id, _.pick(blueprints, ...BlueprintBundles[id]))
	}
})()
