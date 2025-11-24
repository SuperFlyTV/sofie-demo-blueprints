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
		host: 'localhost',
		port: 1176,
		deviceId: 'sisyfos0',
	},
	casparcg: {
		host: 'localhost',
		port: 5250,
	},
	sisyfosSources: {},
	vmixSources: {},
	atemOutputs: {},
	atemSources: {
		camera1: { input: 1, type: SourceType.Camera },
		camera2: { input: 2, type: SourceType.Camera },
		camera3: { input: 3, type: SourceType.Camera },
		camera4: { input: 4, type: SourceType.Camera },
		remote1: { input: 5, type: SourceType.Remote },
		remote2: { input: 6, type: SourceType.Remote },
		mediaplayer: { input: 7, type: SourceType.MediaPlayer },
		graphics: { input: 8, type: SourceType.Graphics },
	},
}
