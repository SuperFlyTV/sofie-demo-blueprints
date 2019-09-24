const _ = require('underscore')

const BlueprintEntrypoints = {
	tv2_afvd_showstyle: './src/tv2_afvd_showstyle/index.ts',
	tv2_afvd_studio: './src/tv2_afvd_studio/index.ts',
	tv2_system: './src/tv2_system/index.ts'
}

const BlueprintBundles = {
	tv2_afvd_blueprints: ['tv2_afvd_showstyle', 'tv2_afvd_studio', 'tv2_system']
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
	GetEntrypointsForBundle
}
