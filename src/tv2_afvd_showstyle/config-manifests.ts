import { ConfigManifestEntry, ConfigManifestEntryType } from 'tv-automation-sofie-blueprints-integration'

export const showStyleConfigManifest: ConfigManifestEntry[] = [
	{
		id: 'DVEStyles',
		name: 'DVE Styles',
		description: '',
		type: ConfigManifestEntryType.TABLE,
		required: false,
		defaultVal: [{ _id: '', DVEName: '', BackgroundLoop: '', DVEJSON: '' }],
		columns: [
			{
				id: 'DVEName',
				name: 'DVE name',
				description: 'The name as it will appear in iNews',
				type: ConfigManifestEntryType.STRING,
				required: true,
				defaultVal: ''
			},
			{
				id: 'BackgroundLoop',
				name: 'Background Loop',
				description: 'Background loop file name',
				type: ConfigManifestEntryType.STRING,
				required: true,
				defaultVal: ''
			},
			{
				id: 'DVEJSON',
				name: 'DVE config',
				description: 'DVE config pulled from ATEM',
				type: ConfigManifestEntryType.STRING,
				required: true,
				defaultVal: ''
			}
		]
	}
]
