const _ = require('underscore')
const axios = require('axios')
const fs = require('fs')
const https = require('https')

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
					rejectUnauthorized: false
				})
			});
	
			instance.post(env.server + '/blueprints/restore/' + id, bundle._cachedSource, {
				headers: {
					'Content-Type': 'text/javascript'
				}
			}).then(() => {
				console.log(`Blueprints '${id}' uploaded`)
			}).catch(e => {
				console.error(`Blueprints '${id}' upload failed:`, e.toString(), e.stack)
			})
		}
	}
}
