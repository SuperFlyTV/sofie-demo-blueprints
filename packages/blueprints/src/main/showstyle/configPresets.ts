import { ShowStyleConfig } from '../../base/showstyle/helpers/config.js'
import { IShowStyleConfigPreset, IShowStyleVariantConfigPreset } from '@sofie-automation/blueprints-integration'
import { demoShowStyleConfigDefaults } from './configs/demo.js'
import { demoVariants } from './variants/demo.js'

export const ShowStyleConfigPreset: Record<string, IShowStyleConfigPreset<ShowStyleConfig>> = {
	demo: {
		name: 'Demo',
		config: demoShowStyleConfigDefaults,
		variants: demoVariants,
	},
}

export function getShowStyleConfigPreset(): Record<string, IShowStyleConfigPreset<ShowStyleConfig>> {
	const result: Record<string, IShowStyleConfigPreset<ShowStyleConfig>> = {}

	for (const [id, entry] of Object.entries<IShowStyleConfigPreset<ShowStyleConfig>>(ShowStyleConfigPreset)) {
		const newEntry = { ...entry }
		for (const [variantId, variant] of Object.entries<IShowStyleVariantConfigPreset<ShowStyleConfig>>(entry.variants)) {
			newEntry.variants[variantId] = {
				...entry.config,
				...variant,
			}
		}

		result[id] = newEntry
	}

	return result
}
