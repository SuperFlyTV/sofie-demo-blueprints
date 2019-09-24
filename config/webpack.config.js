const path = require('path')
const uploader = require('../scripts/upload')
const webpack = require('webpack')
const moment = require('moment')
const pkg = require('../package.json')
const { GetEntrypointsForBundle, BlueprintEntrypoints } = require('../scripts/blueprint-map')

module.exports = env => {
	if (!env) env = {}

	let versionStr = () => ''
	if (env.production) {
		const GitRevisionPlugin = require('git-revision-webpack-plugin')
		const gitRevisionPlugin = new GitRevisionPlugin({
			lightweightTags: true
		})
		versionStr = () => JSON.stringify(pkg.version + '+' + gitRevisionPlugin.version())
	} else {
		versionStr = () => JSON.stringify(pkg.version + '+dev-' + moment().format('YYYYMMDD-HHmm'))
	}

	let versionTSRTypes = pkg.dependencies['timeline-state-resolver-types']
	let versionIntegration = pkg.dependencies['tv-automation-sofie-blueprints-integration']

	if (!versionTSRTypes) throw Error('timeline-state-resolver-types version missing!')
	if (!versionIntegration) throw Error('tv-automation-sofie-blueprints-integration version missing!')

	versionTSRTypes = versionTSRTypes.replace(/[^\d.]/g, '') || '0.0.0'
	versionIntegration = versionIntegration.replace(/[^\d.]/g, '') || '0.0.0'

	const entrypoints = env.bundle ? GetEntrypointsForBundle(env.bundle) : BlueprintEntrypoints

	return {
		entry: entrypoints,
		mode: 'production',
		optimization: {
			minimize: false // This is to make it possible to read and apply hacky fixes to the deployed code as a last resort
		},
		module: {
			rules: [
				{
					test: /\.tsx?$/,
					use: [
						{
							loader: 'ts-loader',
							options: {
								configFile: 'tsconfig.build.json'
							}
						}
					],
					exclude: /node_modules/
				}
			]
		},
		resolve: {
			extensions: ['.tsx', '.ts', '.js']
		},
		output: {
			filename: '[name]-bundle.js',
			path: path.resolve(__dirname, '../dist')
		},
		target: 'node',
		externals: {
			underscore: '_',
			moment: 'moment'
		},
		plugins: [
			new webpack.DefinePlugin({
				VERSION: webpack.DefinePlugin.runtimeValue(versionStr)
			}),
			new webpack.DefinePlugin({
				VERSION_TSR: JSON.stringify(versionTSRTypes)
			}),
			new webpack.DefinePlugin({
				VERSION_INTEGRATION: JSON.stringify(versionIntegration)
			}),
			{
				apply: compiler => {
					compiler.hooks.afterEmit.tap('AfterEmitPlugin', compilation => {
						uploader(env, compilation)
					})
				}
			}
		]
	}
}
