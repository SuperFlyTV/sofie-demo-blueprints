import { BlueprintManifestSet } from '@sofie-automation/blueprints-integration'
import * as fs from 'fs'
import * as _ from 'underscore'
import * as util from 'util'
const { BlueprintBundles } = require('./blueprint-map') // eslint-disable-line @typescript-eslint/no-var-requires
const pWebpackConfig = require('../webpack.config.js') // eslint-disable-line @typescript-eslint/no-var-requires

const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)

async function writeBundle(name: string, blueprints: BlueprintManifestSet) {
	const manifestStr = JSON.stringify(blueprints, undefined, 4)
	await writeFile(`dist/bundle${name ? '-' + name : ''}.json`, manifestStr)
}

;(async () => {
	const blueprints: BlueprintManifestSet = {}
	const webpackConfig = await pWebpackConfig()
	for (const s of Object.keys(webpackConfig.entry)) {
		blueprints[s] = (await readFile(`dist/${s}-bundle.js`)).toString()
	}

	writeBundle('', blueprints)

	for (const id of Object.keys(BlueprintBundles)) {
		writeBundle(id, _.pick(blueprints, ...BlueprintBundles[id]) as BlueprintManifestSet)
	}
})()
