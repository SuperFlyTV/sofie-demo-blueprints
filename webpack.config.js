/* eslint-disable node/no-unpublished-require */
const path = require('path')
const getTranslations = require('./scripts/translation/bundle.js')
const uploader = require('./scripts/upload')
const webpack = require('webpack')
const moment = require('moment')
const pkg = require('./package.json')
const { GetEntrypointsForBundle, BlueprintEntrypoints } = require('./scripts/blueprint-map')
const pkgIntegration = require('@sofie-automation/blueprints-integration/package')
const assetBundler = require('./scripts/bundle-assets')
// eslint-disable-next-line node/no-extraneous-require
const pkgTSR = require('timeline-state-resolver-types/package')

module.exports = async (env) => {
	if (!env) env = {}

	let versionStr = () => ''
	if (env.production) {
		const GitRevisionPlugin = require('git-revision-webpack-plugin')
		const gitRevisionPlugin = new GitRevisionPlugin({
			lightweightTags: true,
		})
		versionStr = () => JSON.stringify(pkg.version + '+' + gitRevisionPlugin.version())
	} else {
		versionStr = () => JSON.stringify(pkg.version + '+dev-' + moment().format('YYYYMMDD-HHmm'))
	}

	let versionTSRTypes = pkgTSR.version
	let versionIntegration = pkgIntegration.version

	if (!versionTSRTypes) throw Error('timeline-state-resolver-types version missing!')
	if (!versionIntegration) throw Error('@sofie-automation/blueprints-integration version missing!')

	// versionTSRTypes = versionTSRTypes.replace(/[^\d.-]/g, '') || '0.0.0'
	// versionIntegration = versionIntegration.replace(/[^\d.-]/g, '') || '0.0.0'

	console.log(`Found versions:`)
	console.log(`timeline-state-resolver-types: ${versionTSRTypes}`)
	console.log(`@sofie-automation/blueprints-integration: ${versionIntegration}`)

	const entrypoints = env.bundle ? GetEntrypointsForBundle(env.bundle) : BlueprintEntrypoints

	const translations = await getTranslations(entrypoints)

	return {
		entry: entrypoints,
		mode: 'production',
		optimization: {
			minimize: false, // This is to make it possible to read and apply hacky fixes to the deployed code as a last resort
		},
		module: {
			rules: [
				{
					test: /\.tsx?$/,
					use: [
						{
							loader: 'ts-loader',
							options: {
								configFile: 'tsconfig.build.json',
							},
						},
					],
					exclude: /node_modules/,
				},
				{
					test: /\.(svg|png)?$/,
					use: [
						{
							loader: 'file-loader',
							options: {
								outputPath: 'assets',
							},
						},
					],
					exclude: /node_modules/,
				},
			],
		},
		resolve: {
			extensions: ['.tsx', '.ts', '.js'],
		},
		output: {
			filename: '[name]-bundle.js',
			path: path.resolve(__dirname, './dist'),
		},
		target: 'node',
		externals: {
			underscore: '_',
			moment: 'moment',
		},
		plugins: [
			new webpack.DefinePlugin({
				VERSION: webpack.DefinePlugin.runtimeValue(versionStr),
			}),
			new webpack.DefinePlugin({
				VERSION_TSR: JSON.stringify(versionTSRTypes),
			}),
			new webpack.DefinePlugin({
				VERSION_INTEGRATION: JSON.stringify(versionIntegration),
			}),
			new webpack.DefinePlugin({
				TRANSLATION_BUNDLES: JSON.stringify(translations),
			}),
			{
				apply: (compiler) => {
					compiler.hooks.afterEmit.tap('AfterEmitPlugin', (compilation) => {
						assetBundler(env, compilation)
					})
				},
			},
			{
				apply: (compiler) => {
					compiler.hooks.afterEmit.tap('AfterEmitPlugin', (compilation) => {
						uploader(env, compilation)
					})
				},
			},
		],
	}
}
