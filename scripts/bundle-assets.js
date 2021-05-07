const fs = require('fs')

module.exports = function (_env, compilation) {
	const assets = Object.keys(compilation.assets).filter((v) => v.match(/\.(png|svg)?$/))
	const assetPayload = {}
	assets.forEach((assetName) => {
		const asset = compilation.assets[assetName]
		const data = asset._value.toString('base64')
		assetPayload[assetName] = data
	})

	fs.writeFileSync('./dist/assets-bundle.json', JSON.stringify(assetPayload))
}
