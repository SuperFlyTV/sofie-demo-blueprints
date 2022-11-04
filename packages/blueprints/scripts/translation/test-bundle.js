const getTranslations = require('./bundle.js')
const { GetEntrypointsForBundle } = require('../blueprint-map.js')

async function run() {
	for (const bundle of ['show']) {
		console.log(bundle)
		const translations = await getTranslations(GetEntrypointsForBundle(bundle))
		console.log(JSON.stringify(translations))
	}
}

run().then(() => console.log('Done'))
