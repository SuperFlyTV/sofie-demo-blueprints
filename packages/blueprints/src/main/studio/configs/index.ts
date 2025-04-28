import { IStudioConfigPreset } from '@sofie-automation/blueprints-integration'
import { StudioConfig } from '../../../base/studio/helpers/config'
import { DemoStudioConfig } from './demo'

export const demoStudioConfigPresets: Record<string, IStudioConfigPreset<StudioConfig>> = {
	demo: {
		name: 'Demo Main Studio',
		config: DemoStudioConfig,
	},
}

export const StudioConfigPresets: Record<string, IStudioConfigPreset<StudioConfig>> = {
	...demoStudioConfigPresets,
}
