import { ConfigManifestEntry, ConfigManifestEntryType } from 'tv-automation-sofie-blueprints-integration'

export const showStyleConfigManifest: ConfigManifestEntry[] = [
	{
		id: 'DVEStyles',
		name: 'DVE Layouts',
		description: '',
		type: ConfigManifestEntryType.TABLE,
		required: false,
		defaultVal: [
			{
				_id: '',
				DVEName: '',
				DVEInputs: '',
				DVEJSON: '{}',
				DVEGraphicsTemplate: '',
				DVEGraphicsTemplateJSON: '{}',
				DVEGraphicsKey: '',
				DVEGraphicsFrame: ''
			}
		],
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
				id: 'DVEInputs',
				name: 'Box inputs',
				description: 'I.e.: 1:INP1;2:INP3; as an example to chose which ATEM boxes to assign iNews inputs to',
				type: ConfigManifestEntryType.STRING,
				required: true,
				defaultVal: '1:INP1;2:INP2;3:INP3;4:INP4'
			},
			{
				id: 'DVEJSON',
				name: 'DVE config',
				description: 'DVE config pulled from ATEM',
				type: ConfigManifestEntryType.STRING,
				required: true,
				defaultVal: ''
			},
			{
				id: 'DVEGraphicsTemplate',
				name: 'CasparCG template',
				description: 'File name (path) for CasparCG overlay template (locators)',
				type: ConfigManifestEntryType.STRING,
				required: true,
				defaultVal: 'dve/locators.html'
			},
			{
				id: 'DVEGraphicsTemplateJSON',
				name: 'CasparCG template config',
				description: 'Position (and style) data for the boxes in the CasparCG template',
				type: ConfigManifestEntryType.STRING,
				required: true,
				defaultVal: ''
			},
			{
				id: 'DVEGraphicsKey',
				name: 'CasparCG key file',
				description: 'Key file for DVE',
				type: ConfigManifestEntryType.STRING,
				required: true,
				defaultVal: ''
			},
			{
				id: 'DVEGraphicsFrame',
				name: 'CasparCG frame file',
				description: 'Frames file for caspar',
				type: ConfigManifestEntryType.STRING,
				required: true,
				defaultVal: ''
			}
		]
	},
	{
		/*
		Graphic template setup								
		inews code	
		inews name	
		Grafik template (viz)	
		destination	default out (default, S, B, O)	
		var 1 name	
		var 2 name 	
		note
		*/
		id: 'GFXTemplates',
		name: 'GFX Templates',
		description: 'Graphics Template Setup',
		type: ConfigManifestEntryType.TABLE,
		required: false,
		defaultVal: [
			{
				_id: '',
				INewsCode: '',
				INewsName: '',
				VizTemplate: '',
				VizDestination: '',
				OutType: '', // (default(''), S, B, O)
				Argument1: '',
				Argument2: '',
				IsDesign: false
			}
		],
		columns: [
			{
				id: 'INewsCode',
				name: 'iNews Command',
				description: 'The code as it will appear in iNews',
				type: ConfigManifestEntryType.STRING,
				required: true,
				defaultVal: ''
			},
			{
				id: 'iNewsName',
				name: 'iNews Name',
				description: 'The name after the code',
				type: ConfigManifestEntryType.STRING,
				required: true,
				defaultVal: ''
			},
			{
				id: 'VizTemplate',
				name: 'Viz Template Name',
				description: 'The name of the Viz Template',
				type: ConfigManifestEntryType.STRING,
				required: true,
				defaultVal: ''
			},
			{
				id: 'VizDestination',
				name: 'Viz Destination',
				description: 'The name of the Viz Engine',
				type: ConfigManifestEntryType.STRING,
				required: true,
				defaultVal: ''
			},
			{
				id: 'OutType',
				name: 'Out type',
				description: 'The type of out, none follow timecode, S stays on to ??, B stays on to ??, O stays on to ??',
				type: ConfigManifestEntryType.STRING,
				required: true,
				defaultVal: ''
			},
			{
				id: 'Argument1',
				name: 'Variable 1',
				description: 'Argument passed to Viz',
				type: ConfigManifestEntryType.STRING,
				required: true,
				defaultVal: ''
			},
			{
				id: 'Argument2',
				name: 'Variable 2',
				description: 'Argument passed to Viz',
				type: ConfigManifestEntryType.STRING,
				required: true,
				defaultVal: ''
			},
			{
				id: 'IsDesign',
				name: 'Changes Design',
				description: 'Whether this cue changes the design',
				type: ConfigManifestEntryType.BOOLEAN,
				required: false,
				defaultVal: false
			}
		]
	},
	{
		/*
		Jingle Timings
		Jingle Name
		File Name
		Frames of Alpha
		*/
		id: 'JingleTimings',
		name: 'Jingle Timings',
		description: 'Jingle configuration',
		type: ConfigManifestEntryType.TABLE,
		required: false,
		defaultVal: [
			{
				_id: '',
				JingleName: 0,
				FileName: '',
				FramesOfAlpha: 0
			}
		],
		columns: [
			{
				id: 'JingleName',
				name: 'Jingle Name',
				description: 'The jingle name',
				type: ConfigManifestEntryType.STRING,
				required: true,
				defaultVal: ''
			},
			{
				id: 'FileName',
				name: 'File Name',
				description: 'The name of the jingle clip',
				type: ConfigManifestEntryType.STRING,
				required: true,
				defaultVal: ''
			},
			{
				id: 'FramesOfAlpha',
				name: 'Frames of Alpha',
				description: 'Number of frames of alpha at the beginning of the clip',
				type: ConfigManifestEntryType.NUMBER,
				required: true,
				defaultVal: 0
			}
		]
	},
	{
		/*
		Wipes Config
		Effekt number
		Clip name
		Alpha at start
		Alpha at end
		*/
		id: 'WipesConfig',
		name: 'Wipes Configuration',
		description: 'Wipes effekts configuration',
		type: ConfigManifestEntryType.TABLE,
		required: false,
		defaultVal: [
			{
				_id: '',
				EffektNumber: 0,
				ClipName: '',
				Duration: 0,
				StartAlpha: 0,
				EndAlpha: 0
			}
		],
		columns: [
			{
				id: 'EffektNumber',
				name: 'Effekt Number',
				description: 'The Effect Number',
				type: ConfigManifestEntryType.NUMBER,
				required: true,
				defaultVal: 0
			},
			{
				id: 'ClipName',
				name: 'Clip Name',
				description: 'The name of the wipe clip',
				type: ConfigManifestEntryType.STRING,
				required: true,
				defaultVal: ''
			},
			{
				id: 'Duration',
				name: 'Effekt Duration',
				description: 'Duration of the effekt',
				type: ConfigManifestEntryType.NUMBER,
				required: true,
				defaultVal: 0
			},
			{
				id: 'StartAlpha',
				name: 'Alpha at Start',
				description: 'Number of frames of alpha at start',
				type: ConfigManifestEntryType.NUMBER,
				required: true,
				defaultVal: 0
			},
			{
				id: 'EndAlpha',
				name: 'Alpha at End',
				description: 'Number of frames of alpha at end',
				type: ConfigManifestEntryType.NUMBER,
				required: true,
				defaultVal: 0
			}
		]
	},
	{
		/*
		Breaker Config
		Effekt number
		Clip name
		Alpha at start
		Alpha at end
		*/
		id: 'BreakerConfig',
		name: 'Breaker Configuration',
		description: 'Breaker configuration',
		type: ConfigManifestEntryType.TABLE,
		required: false,
		defaultVal: [
			{
				_id: '',
				BreakerName: '',
				ClipName: '',
				Duration: 0,
				StartAlpha: 0,
				EndAlpha: 0
			}
		],
		columns: [
			{
				id: 'BreakerName',
				name: 'Breaker name',
				description: 'Breaker name as typed in iNews',
				type: ConfigManifestEntryType.STRING,
				required: true,
				defaultVal: ''
			},
			{
				id: 'ClipName',
				name: 'Clip Name',
				description: 'The name of the breaker clip to play',
				type: ConfigManifestEntryType.STRING,
				required: true,
				defaultVal: ''
			},
			{
				id: 'Duration',
				name: 'Effekt Duration',
				description: 'Duration of the effekt',
				type: ConfigManifestEntryType.NUMBER,
				required: true,
				defaultVal: 0
			},
			{
				id: 'StartAlpha',
				name: 'Alpha at Start',
				description: 'Number of frames of alpha at start',
				type: ConfigManifestEntryType.NUMBER,
				required: true,
				defaultVal: 0
			},
			{
				id: 'EndAlpha',
				name: 'Alpha at End',
				description: 'Number of frames of alpha at end',
				type: ConfigManifestEntryType.NUMBER,
				required: true,
				defaultVal: 0
			}
		]
	},
	{
		id: 'DefaultTemplateDuration',
		name: 'Default Template Duration',
		description: 'Default Template Duration',
		type: ConfigManifestEntryType.NUMBER,
		required: true,
		defaultVal: 4
	}
]
