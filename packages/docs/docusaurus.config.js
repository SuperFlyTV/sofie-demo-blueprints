// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github')
const darkCodeTheme = require('prism-react-renderer/themes/dracula')

/** @type {import('@docusaurus/types').Config} */
const config = {
	title: 'Sofie Demo Blueprints Documentation',
	tagline: 'Documentation for the Sofie TV Automation demo blueprints.',
	url: 'https://superflytv.github.io',
	baseUrl: '/sofie-demo-blueprints/',
	onBrokenLinks: 'throw',
	onBrokenMarkdownLinks: 'warn',
	favicon: 'img/favicon.ico',
	organizationName: 'superflytv', // Usually your GitHub org/user name.
	projectName: 'sofie-demo-blueprints', // Usually your repo name.
	deploymentBranch: 'gh-pages',
	trailingSlash: false,
	i18n: {
		defaultLocale: 'en',
		locales: ['en'],
	},
	presets: [
		[
			'classic',
			/** @type {import('@docusaurus/preset-classic').Options} */
			({
				docs: {
					sidebarPath: require.resolve('./sidebars.js'),
					editUrl: 'https://github.com/SuperFlyTV/sofie-demo-blueprints/tree/docs/docusaurus/packages/docs/docs',
				},
				theme: {
					customCss: require.resolve('./src/css/custom.css'),
				},
			}),
		],
	],
	themeConfig:
		/** @type {import('@docusaurus/preset-classic').ThemeConfig} */
		({
			colorMode: {
				defaultMode: 'light',
				disableSwitch: false,
				respectPrefersColorScheme: true,
			},
			navbar: {
				title: 'Sofie Demo Blueprints',
				logo: {
					alt: 'Sofie Logo',
					src: 'img/sofie-logo.svg',
				},
				items: [
					{
						type: 'doc',
						docId: 'intro',
						position: 'left',
						label: 'Tutorial',
					},
					{
						href: 'https://github.com/SuperFlyTV/sofie-demo-blueprints',
						label: 'GitHub',
						position: 'right',
					},
				],
			},
			footer: {
				style: 'dark',
				links: [
					{
						title: 'Docs',
						items: [
							{
								label: 'Tutorial',
								to: '/docs/intro',
							},
						],
					},
					{
						title: 'Community',
						items: [
							{
								label: 'Sofie Slack Community',
								href: 'https://join.slack.com/t/sofietv/shared_invite/enQtNTk2Mzc3MTQ1NzAzLTJkZjMyMDg3OGM0YWU3MmU4YzBhZDAyZWI1YmJmNmRiYWQ1OTZjYTkzOTkzMTA2YTE1YjgxMmVkM2U1OGZlNWI',
							},
						],
					},
					{
						title: 'More',
						items: [
							{
								label: 'GitHub',
								href: 'https://github.com/SuperFlyTV/sofie-demo-blueprints',
							},
						],
					},
				],
				copyright: `Copyright © ${new Date().getFullYear()} SuperFlyTV AB`,
			},
			prism: {
				theme: lightCodeTheme,
				darkTheme: darkCodeTheme,
			},
			docs: {
				sidebar: {
					hideable: true,
					autoCollapseCategories: true,
				},
			},
		}),
	plugins: [[require.resolve('docusaurus-lunr-search'), {}]],
}

module.exports = config
