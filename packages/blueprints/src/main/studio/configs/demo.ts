import { StudioConfig, VisionMixerType } from '../../../base/studio/helpers/config.js'

export const DemoStudioConfig: StudioConfig = {
	previewRenderer: 'sofie',
	casparcgLatency: 0,
	visionMixerType: VisionMixerType.Atem,
	sisyfosSources: {},
	vmixSources: {},
	atemOutputs: {},
	atemSources: {},
}
