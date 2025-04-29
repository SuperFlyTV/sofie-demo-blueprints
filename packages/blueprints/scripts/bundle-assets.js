const fs = require('fs')

module.exports = function (_env, compilation) {
	const assets = Object.keys(compilation.assets).filter((v) => v.match(/\.(png|svg)?$/))
	const assetPayload = {}
	assets.forEach((assetName) => {
		const asset = compilation.assets[assetName]
		const data = asset.buffer().toString('base64')
		assetPayload[assetName] = data
	})

	try {
		fs.mkdirSync('./dist')
	} catch (_e) {
		// It either already exists, or the write will fail with a useful error
	}

	fs.writeFileSync('./dist/assets-bundle.json', JSON.stringify(assetPayload))
}
