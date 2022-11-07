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
	{
		id: 'dvePresets',
		name: 'DVE Presets',
		description: 'DVE Presets',
		type: ConfigManifestEntryType.TABLE,
		required: false,
		columns: [
			{
				id: 'name',
				name: 'Preset name',
				description: 'Name to use in rundown editor',
				type: ConfigManifestEntryType.STRING,
				required: true,
				defaultVal: '',
				rank: 0,
			},
			{
				id: 'boxes',
				name: 'Boxes',
				description: 'Number of boxes this preset contains',
				type: ConfigManifestEntryType.INT,
				required: true,
				defaultVal: 2,
				rank: 1,
			},
			{
				id: 'preset',
				name: 'JSON Preset',
				description: 'JSON configuration of the supersource',
				type: ConfigManifestEntryType.JSON,
				required: false,
				defaultVal: '',
				rank: 2,
			},
		],
		defaultVal: [
			{
				_id: '2split',
				name: '2split',
				boxes: 2,
				preset:
					'{"index":0,"boxes":[{"enabled":true,"source":1000,"x":-770,"y":90,"size":600,"cropped":true,"cropTop":0,"cropBottom":0,"cropLeft":4000,"cropRight":4000},{"enabled":true,"source":2002,"x":770,"y":90,"size":600,"cropped":true,"cropTop":0,"cropBottom":0,"cropLeft":4000,"cropRight":4000}],"properties":{"artFillSource":3010,"artCutSource":3011,"artOption":0,"artPreMultiplied":true,"artClip":0,"artGain":0,"artInvertKey":false},"border":{"borderEnabled":true,"borderBevel":0,"borderOuterWidth":25,"borderInnerWidth":0,"borderOuterSoftness":0,"borderInnerSoftness":0,"borderBevelSoftness":0,"borderBevelPosition":0,"borderHue":0,"borderSaturation":0,"borderLuma":1000,"borderLightSourceDirection":0,"borderLightSourceAltitude":0}}',
			},
		],
	},
]
