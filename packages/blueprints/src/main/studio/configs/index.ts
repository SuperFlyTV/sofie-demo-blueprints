import { IStudioConfigPreset } from '@sofie-automation/blueprints-integration'
import { StudioConfig } from '../../../base/studio/helpers/config.js'
import { DemoOBSStudioConfig, DemoStudioConfig } from './demo.js'

export const demoStudioConfigPresets: Record<string, IStudioConfigPreset<StudioConfig>> = {
	demo: {
		name: 'Demo Main Studio',
		config: DemoStudioConfig,
	},
	demoOBS: {
		name: 'Demo OBS Studio',
		config: DemoOBSStudioConfig,
	},
}

export const StudioConfigPresets: Record<string, IStudioConfigPreset<StudioConfig>> = {
	...demoStudioConfigPresets,
}
