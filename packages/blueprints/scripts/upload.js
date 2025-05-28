const https = require('https')
const { promises: fs } = require('fs')

module.exports = function (env, compilation) {
	if (!env.server) return

	// TODO - allow include/exclude of certain blueprints

	for (let e of compilation.entrypoints) {
		const id = e[0]
		const filename = id + '-bundle.js'

		const bundle = compilation.assets[filename]
		const data = bundle ? bundle.buffer() : null

		if (bundle && data) {
			console.log('Starting upload: ' + data.length + ' bytes to ' + id)

			fetch(env.server + '/api/private/blueprints/restore/' + id, {
				method: 'POST',
				headers: {
					'Content-Type': 'text/javascript',
				},
				body: data,
				agent: new https.Agent({
					rejectUnauthorized: false,
				}),
			})
				.then((response) => {
					if (!response.ok) {
						return response.text().then((text) => {
							throw new Error(`Blueprints '${id}' upload failed: ${response.status} ${response.statusText} - ${text}`)
						})
					}
					console.log(`Blueprints '${id}' uploaded`)
				})
				.catch((error) => {
					console.error(`Blueprints '${id}' upload failed:`, error.toString(), error.stack)
					console.error(error)
				})
		}
	}

	// upload image assets
	fs.readFile('./dist/assets-bundle.json')
		.then((payload) => {
			fetch(env.server + '/api/private/blueprints/assets', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: payload,
				agent: new https.Agent({
					rejectUnauthorized: false,
				}),
			})
				.then((response) => {
					if (!response.ok) {
						return response.text().then((text) => {
							throw new Error(`Blueprints assets upload failed: ${response.status} ${response.statusText} - ${text}`)
						})
					}
					console.log(`Blueprints assets uploaded`)
				})
				.catch((error) => {
					console.error(`Blueprints assets upload failed:`, error.toString(), error.stack)
				})
		})
		.catch((error) => {
			if (error) {
				console.error('Error reading assets-bundle.json:', error)
			}
		})
}
