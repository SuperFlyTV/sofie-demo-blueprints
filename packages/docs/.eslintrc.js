const {
	tsExtends,
	commonRules,
	tsRules,
	tsParser,
} = require('../../node_modules/@sofie-automation/code-standard-preset/eslint/fragments') // eslint-disable-line n/no-unpublished-require

const localCommonRules = {
	'import/no-unresolved': [2, { ignore: ['^@theme', '^@docusaurus', '^@site'] }],
	'n/no-missing-import': 'off',
}

module.exports = {
	root: true,
	plugins: ['@docusaurus', 'import'],
	extends: ['../../node_modules/@sofie-automation/code-standard-preset/eslint/main', 'plugin:@docusaurus/recommended'],
	settings: {
		react: {
			version: 'detect',
		},
		'import/parsers': {
			'@typescript-eslint/parser': ['.ts', '.tsx'],
		},
		'import/resolver': {
			typescript: {},
		},
	},
	rules: {
		...localCommonRules,
	},
	overrides: [
		// Note: these replace the values defined above, so make sure to extend them if they are needed
		{
			files: ['*.tsx'],
			extends: [
				...tsExtends,
				'plugin:react/recommended',
				'plugin:react-hooks/recommended',
				'plugin:@docusaurus/recommended',
			],
			parserOptions: {
				...tsParser.parserOptions,
				ecmaFeatures: {
					jsx: true,
				},
			},
			rules: {
				...commonRules,
				...tsRules,
				...localCommonRules,
			},
		},
	],
}
