import * as fs from 'fs'
import * as util from 'util'
import * as _ from 'underscore'
import { BlueprintManifestSet } from 'tv-automation-sofie-blueprints-integration'
const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)

const webpackConfig = require('../config/webpack.config.js')
const sources = _.keys(webpackConfig().entry);

(async () => {
	const blueprints: BlueprintManifestSet = {}
	for (const s of sources) {
		blueprints[s] = (await readFile(`dist/${s}-bundle.js`)).toString()
	}

	const manifestStr = JSON.stringify(blueprints, undefined, 4)
	await writeFile(`dist/bundle.json`, manifestStr)
})()
