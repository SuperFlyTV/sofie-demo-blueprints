const _ = require('underscore')

const BlueprintEntrypoints = {
	showstyle0: './src/showstyle0/index.ts',
	studio0: './src/studio0/index.ts',
	system: './src/system/index.ts',
}

const BlueprintBundles = {
	show: ['showstyle0', 'studio0', 'system'],
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
