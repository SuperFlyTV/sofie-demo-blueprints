import { ShowStyleConfig } from '../../base/showstyle/helpers/config'
import { IShowStyleConfigPreset, IShowStyleVariantConfigPreset } from '@sofie-automation/blueprints-integration'
import { demo1ShowStyleConfigDefaults } from './configs/demo1'
import { demo1Variants } from './variants/demo1'

export const ShowStyleConfigPreset: Record<string, IShowStyleConfigPreset<ShowStyleConfig>> = {
	demo1: {
		name: 'Demo-1',
		config: demo1ShowStyleConfigDefaults,
		variants: demo1Variants,
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
