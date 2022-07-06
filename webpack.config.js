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
const { TMP_TSR_VERSION } = require('@sofie-automation/blueprints-integration')

module.exports = async (env) => {
	if (!env) env = {}

	let versionStr
	if (env.production) {
		const GitRevisionPlugin = require('git-revision-webpack-plugin')
		const gitRevisionPlugin = new GitRevisionPlugin({
			lightweightTags: true,
		})
		versionStr = () => JSON.stringify(pkg.version + '+' + gitRevisionPlugin.version())
	} else {
		versionStr = () => JSON.stringify(pkg.version + '+dev-' + moment().format('YYYYMMDD-HHmm'))
	}

	const versionTSRTypes = TMP_TSR_VERSION
	const versionIntegration = pkgIntegration.version

	if (!versionTSRTypes) throw Error('timeline-state-resolver-types version missing!')
	if (!versionIntegration) throw Error('@sofie-automation/blueprints-integration version missing!')

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
			// runtimeChunk: true,
			splitChunks: false,
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
			library: {
				// This sets up the bundle as sofie expects to parse it
				name: 'blueprint',
				type: 'assign-properties',
			},
		},
		target: 'node14.19',
		externals: {},
		plugins: [
			new webpack.DefinePlugin({
				VERSION: webpack.DefinePlugin.runtimeValue(versionStr),
				VERSION_TSR: JSON.stringify(versionTSRTypes),
				VERSION_INTEGRATION: JSON.stringify(versionIntegration),
				TRANSLATION_BUNDLES: JSON.stringify(translations),
			}),
			{
				apply: (compiler) => {
					compiler.hooks.emit.tap('BundleAssets', (compilation) => {
						assetBundler(env, compilation)
					})
				},
			},
			{
				apply: (compiler) => {
					compiler.hooks.emit.tap('UploadResult', (compilation) => {
						uploader(env, compilation)
					})
				},
			},
		],
	}
}
