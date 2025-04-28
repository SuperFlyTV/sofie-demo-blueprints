const _ = require('underscore')

const BlueprintEntrypoints = {
	showstyle: './src/main/showstyle/index.ts',
	studio: './src/main/studio/index.ts',
	system: './src/system/index.ts',
}

const BlueprintBundles = {
	show: ['showstyle', 'studio', 'system'],
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
