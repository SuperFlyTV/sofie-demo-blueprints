import { ConfigManifestEntry, ConfigManifestEntryType } from '@sofie-automation/blueprints-integration'
import { AtemSourceType } from './helpers/config'

export const studioConfigManifest: ConfigManifestEntry[] = [
	{
		id: 'atemSources',
		name: 'Atem Sources',
		description: 'Description of Atem inputs i.e. cameras, remotes etc.',
		type: ConfigManifestEntryType.TABLE,
		required: true,
		defaultVal: [],
		columns: [
			{
				id: 'input',
				name: 'Input',
				description: 'Input number on the atem, see https://atem.julusian.dev/enums#videosource',
				type: ConfigManifestEntryType.NUMBER,
				required: true,
				defaultVal: 0,
				rank: 1,
			},
			{
				id: 'type',
				name: 'Type',
				description: 'Input type',
				type: ConfigManifestEntryType.ENUM,
				options: [AtemSourceType.Camera, AtemSourceType.Remote, AtemSourceType.MediaPlayer, AtemSourceType.Graphics],
				required: true,
				defaultVal: 'camera',
				rank: 2,
			},
		],
	},
	{
		id: 'atemOutputs',
		name: 'Atem Outputs',
		description: 'Description of Atem outputs / auxes',
		type: ConfigManifestEntryType.TABLE,
		required: true,
		defaultVal: [],
		columns: [
			{
				id: 'output',
				name: 'Output',
				description: 'Aux number on the atem',
				type: ConfigManifestEntryType.NUMBER,
				required: true,
				defaultVal: 1,
				rank: 1,
			},
			{
				id: 'source',
				name: 'Source',
				description: 'Source number, see https://atem.julusian.dev/enums#videosource',
				type: ConfigManifestEntryType.NUMBER,
				required: true,
				defaultVal: 1,
				rank: 2,
			},
		],
	},
]
