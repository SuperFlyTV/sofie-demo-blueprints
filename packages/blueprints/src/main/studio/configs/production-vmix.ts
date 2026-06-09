import { SourceType, StudioConfig, VisionMixerDevice, VmixControlMode } from '../../../base/studio/helpers/config.js'

/**
 * Example production vMix newsroom studio configuration.
 * Uses registry-driven inputs, overlay graphics, and mix-bus mappings.
 */
export const ProductionVmixStudioConfig: StudioConfig = {
	previewRenderer: 'sofie',
	casparcgLatency: 0,
	vmixControlMode: VmixControlMode.Production,
	visionMixer: {
		type: VisionMixerDevice.VMix,
		host: '127.0.0.1',
		port: 8099,
		deviceId: 'vmix0',
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
	vmixInputs: {
		CAMERA: {
			input: 'Cam 1',
			role: 'camera1',
		},
		DOUBLEBOX: {
			input: 'Double Box',
			role: 'dve_doublebox',
		},
		LOWER_THIRD: {
			input: 'Lower Third',
			overlay: 1,
			role: 'lower_third',
		},
		HEADLINE: {
			input: 'Headline',
			overlay: 2,
			role: 'headline',
		},
		BUG: {
			input: 'Bug',
			overlay: 3,
			role: 'bug',
		},
		BG_LOOP: {
			input: 'Background Loop',
			loop: true,
			playOnActivate: true,
			role: 'mediaplayer',
		},
		MIX3_FEED: {
			input: 'Mix3 Feed',
			mix: 3,
			role: 'mix3_feed',
		},
	},
	vmixGraphicsTargets: {
		lowerThird: 'LOWER_THIRD',
		headline: 'HEADLINE',
		bug: 'BUG',
		logo: 'BUG',
		strap: 'HEADLINE',
	},
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
