const locales = ['en', 'nb', 'nn']
const translationsPath = 'locales/$LOCALE/$NAMESPACE'
const conversionOptions = {
	gettextDefaultCharset: 'UTF-8',
	splitNewLine: true,
	ignorePlurals: true,
}
const extractOptions = {
	useKeysAsDefaultValue: false,
	sort: true,
	namespaceSeparator: false,
	keySeparator: false,
	defaultValue: '',
	keepRemoved: false,
	locales,
	output: translationsPath,
	lexers: {
		ts: [
			{
				lexer: 'JavascriptLexer',
				functions: ['notifyUserWarning', 'notifyUserError'], // Array of functions to match
			},
		],
	},
}

module.exports = { translationsPath, conversionOptions, extractOptions }
