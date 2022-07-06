import { BlueprintManifestSet } from '@sofie-automation/blueprints-integration'
import * as fs from 'fs'
import * as _ from 'underscore'
import * as util from 'util'
const { BlueprintBundles } = require('./blueprint-map') // eslint-disable-line @typescript-eslint/no-var-requires
const pWebpackConfig = require('../webpack.config.js') // eslint-disable-line @typescript-eslint/no-var-requires

const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)

async function writeBundle(name: string, blueprints: BlueprintManifestSet): Promise<void> {
	const manifestStr = JSON.stringify(blueprints, undefined, 4)
	await writeFile(`dist/bundle${name ? '-' + name : ''}.json`, manifestStr)
}

void (async () => {
	const blueprints: BlueprintManifestSet = {
		blueprints: {},
		assets: {},
	}
	const webpackConfig = await pWebpackConfig()
	for (const s of Object.keys(webpackConfig.entry)) {
		blueprints.blueprints[s] = (await readFile(`dist/${s}-bundle.js`)).toString()
	}

	try {
		const assets = (await readFile('dist/assets-bundle.json')).toString()
		blueprints.assets = JSON.parse(assets) as { [index: string]: string }
	} catch (e) {
		console.log('Failed to bundle assets', e)
	}

	await writeBundle('', blueprints)

	await Promise.all(
		Object.keys(BlueprintBundles).map(async (id) =>
			writeBundle(id, _.pick(blueprints, ...BlueprintBundles[id]) as BlueprintManifestSet)
		)
	)
})()
