const axios = require('axios')
const https = require('https')
const { promises: fs } = require('fs')

module.exports = function (env, compilation) {
	if (!env.server) return

	// TODO - allow include/exclude of certain blueprints

	for (let e of compilation.entrypoints) {
		const id = e[0]
		const filename = id + '-bundle.js'

		const bundle = compilation.assets[filename]
		if (bundle && bundle._cachedSource) {
			console.log('Starting upload: ' + bundle._cachedSource.length + ' bytes to ' + id)

			const instance = axios.create({
				httpsAgent: new https.Agent({
					rejectUnauthorized: false,
				}),
			})

			instance
				.post(env.server + '/blueprints/restore/' + id, bundle._cachedSource, {
					headers: {
						'Content-Type': 'text/javascript',
					},
				})
				.then(() => {
					console.log(`Blueprints '${id}' uploaded`)
				})
				.catch((e) => {
					console.error(`Blueprints '${id}' upload failed:`, e.toString(), e.stack)
				})
		}
	}

	// upload image assets
	try {
		fs.readFile('./dist/assets-bundle.json').then((payload) => {
			const instance = axios.create({
				httpsAgent: new https.Agent({
					rejectUnauthorized: false,
				}),
			})

			instance
				.post(env.server + '/blueprints/assets', payload, {
					headers: {
						'Content-Type': 'application/json',
					},
				})
				.then(() => {
					console.log(`Blueprints assets uploaded`)
				})
				.catch((e) => {
					console.error(`Blueprints assets upload failed:`, e.toString(), e.stack)
				})
		})
	} catch (e) {
		//
	}
}
