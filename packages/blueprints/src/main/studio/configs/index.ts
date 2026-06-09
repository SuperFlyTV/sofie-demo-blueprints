import { IStudioConfigPreset } from '@sofie-automation/blueprints-integration'
import { StudioConfig } from '../../../base/studio/helpers/config.js'
import { DemoStudioConfig } from './demo.js'
import { ProductionVmixStudioConfig } from './production-vmix.js'

export const demoStudioConfigPresets: Record<string, IStudioConfigPreset<StudioConfig>> = {
	demo: {
		name: 'Demo Main Studio',
		config: DemoStudioConfig,
	},
	productionVmix: {
		name: 'Production vMix Newsroom',
		config: ProductionVmixStudioConfig,
	},
}

export const StudioConfigPresets: Record<string, IStudioConfigPreset<StudioConfig>> = {
	...demoStudioConfigPresets,
}
