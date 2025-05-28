const _ = require('underscore')

const BlueprintEntrypoints = {
	demoshowstyle: './src/main/showstyle/index.ts',
	demostudio: './src/main/studio/index.ts',
	system: './src/system/index.ts',
}

const BlueprintBundles = {
	show: ['demoshowstyle', 'demostudio', 'system'],
}

function GetEntrypointsForBundle(id) {
	if (id === '' || id === 'all') {
		return BlueprintEntrypoints
	} else {
		const bundle = BlueprintBundles[id]
		if (bundle) {
			return _.pick(BlueprintEntrypoints, ...bundle)
		} else {
			return {}
		}
	}
}

module.exports = {
	BlueprintBundles,
	BlueprintEntrypoints,
	GetEntrypointsForBundle,
}
