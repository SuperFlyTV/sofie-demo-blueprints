import { SourceType, StudioConfig, VisionMixerDevice } from '../../../base/studio/helpers/config.js'

export const DemoStudioConfig: StudioConfig = {
	previewRenderer: 'sofie',
	casparcgLatency: 0,
	visionMixer: {
		type: VisionMixerDevice.Atem,
		host: '0.0.0.0',
		port: 9910,
		deviceId: 'atem0',
	},
	audioMixer: {
		host: '0.0.0.0',
		port: 1176,
		deviceId: 'sisyfos0',
	},
	sisyfosSources: {},
	vmixSources: {},
	atemOutputs: {},
	atemSources: {
		camera1: {
			input: 1,
			type: SourceType.Camera,
			label: 'Camera 1',
		},
		camera2: {
			input: 2,
			type: SourceType.Camera,
			label: 'Camera 2',
		},
		camera3: {
			input: 3,
			type: SourceType.Camera,
			label: 'Camera 3',
		},
		camera4: {
			input: 4,
			type: SourceType.Camera,
			label: 'Camera 4',
		},
		remote1: {
			input: 5,
			type: SourceType.Remote,
			label: 'Live 1',
		},
		remote2: {
			input: 6,
			type: SourceType.Remote,
			label: 'Live 2',
		},
		remote3: {
			input: 7,
			type: SourceType.Remote,
			label: 'Live 3',
		},
		remote4: {
			input: 8,
			type: SourceType.Remote,
			label: 'Live 4',
		},
		player1: {
			input: 9, // ATEM MediaPlayer 1
			type: SourceType.MediaPlayer,
			label: 'Media Player 1',
		},
		player2: {
			input: 10, // ATEM MediaPlayer 2
			type: SourceType.MediaPlayer,
			label: 'Media Player 2',
		},
		gfx: {
			input: 11, // ATEM Color Bars or appropriate GFX input
			type: SourceType.Graphics,
			label: 'Graphics',
		},
	},
}
