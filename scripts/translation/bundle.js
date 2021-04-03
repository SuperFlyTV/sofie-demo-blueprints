/**
 * This script will read and bundle the translations in the project's .po files.
 * It is intended to be used by the Webpack config script.
 */
const path = require('path')
const stream = require('stream')
const vfs = require('vinyl-fs')
const { gettextToI18next } = require('i18next-conv')
const { readFile } = require('fs').promises

const { conversionOptions } = require('./config.js')

class poToI18nextTransform extends stream.Transform {
	constructor() {
		super({ objectMode: true })
	}

	_transform(file, encoding, callback) {
		const start = Date.now()
		const language = file.dirname.split(/[/|\\]/).pop()
		const namespace = file.stem

		readFile(file.path, 'utf-8')
			.then((poFile) => {
				if (!poFile) {
					return null
				}

				return gettextToI18next(
					language,
					poFile,
					Object.assign({}, conversionOptions, {
						language,
						// Keys with no value will fall back to default bundle, and eventually the key itself will
						// be used as value if no values are found. Since we use the string as key, this means
						// untranslated keys will be represented by their original (English) text. This is not great
						// but better than inserting empty strings everywhere.
						skipUntranslated: true,
						ns: file.stem,
					})
				)
			})
			.then(JSON.parse)
			.then((data) => {
				console.info(
					`Processed ${namespace} ${language} (${Object.keys(data).length} translated keys) (${Date.now() - start} ms)`
				)
				callback(null, {
					type: 'i18next',
					language,
					namespace,
					data,
				})
			})
			.catch(callback)
	}
}

function mergeByLanguage(translations) {
	const languages = {}

	for (const translation of translations) {
		const { language, data } = translation
		if (!languages[language]) {
			languages[language] = data
		} else {
			Object.assign(languages[language], data)
		}
	}

	return Object.keys(languages).map((language) => ({ language, data: languages[language], type: 'i18next' }))
}

async function getTranslations(translations) {
	const out = []
	for await (const translation of translations) {
		out.push(translation)
	}

	console.info('Translations bundling complete.')

	return mergeByLanguage(out)
}

module.exports = async (entrypoints) => {
	const namespaceFileNames = []
	for (const entrypoint in entrypoints) {
		const bundleFolderName = path
			.parse(entrypoints[entrypoint])
			.dir.split(/[/|\\]/)
			.pop()
		namespaceFileNames.push(`locales/**/${bundleFolderName}.po`)
	}

	console.info('Bundling translations...')

	const translations = vfs.src(namespaceFileNames).pipe(new poToI18nextTransform())
	return await getTranslations(translations)
}
