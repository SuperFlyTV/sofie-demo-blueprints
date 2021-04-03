import { ConfigManifestEntry, ConfigManifestEntryType } from '@sofie-automation/blueprints-integration'

export const showStyleConfigManifest: ConfigManifestEntry[] = [
	{
		id: 'dummyEntry',
		name: 'Dummy entry',
		description: 'example',
		type: ConfigManifestEntryType.BOOLEAN,
		required: false,
		defaultVal: false,
	},
]
