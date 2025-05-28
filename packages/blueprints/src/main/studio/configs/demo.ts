import { StudioConfig, VisionMixerDevice } from '../../../base/studio/helpers/config.js'

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
	atemSources: {},
}
