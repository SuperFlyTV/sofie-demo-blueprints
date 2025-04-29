import { ShowStyleConfig } from '../../../base/showstyle/helpers/config.js'
import { IShowStyleVariantConfigPreset } from '@sofie-automation/blueprints-integration'

type VariantsConfig = Pick<ShowStyleConfig, 'dvePresets'>

export const demoVariants: Record<string, IShowStyleVariantConfigPreset<VariantsConfig>> = {
	demo1: {
		name: 'Demo-1',
		config: {
			dvePresets: {},
		},
	},
	demo2: {
		name: 'Demo-2',
		config: {
			dvePresets: {},
		},
	},
	demo3: {
		name: 'Demo-3',
		config: {
			dvePresets: {},
		},
	},
}
