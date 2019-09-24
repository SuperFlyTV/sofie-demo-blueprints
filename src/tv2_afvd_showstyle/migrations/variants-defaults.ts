import * as _ from 'underscore'
import { MigrationStepShowStyle, MigrationContextShowStyle } from 'tv-automation-sofie-blueprints-integration'
import { literal } from '../../common/util'

declare const VERSION: string // Injected by webpack

/**
 * Variants can be used to configure small variants in how running orders are generated from the input data.
 * This can be useful when there are multiple studios producing a very similar show.
 */

export type VariantRegion = {
	[key: string]: {
		name: string
	}
}

export const showVariants = literal<VariantRegion>({
	oddasat: {
		name: 'Main'
	}
})

export function getCreateVariantMigrationSteps () {
	return _.keys(showVariants).map((key) => {
		return literal<MigrationStepShowStyle>({
			id: `variant.${key}`,
			version: VERSION,
			canBeRunAutomatically: true,
			validate: (context: MigrationContextShowStyle) => {
				const variant = context.getVariant(key)
				if (!variant) return `Variant "${key}" doesn't exist`
				return false
			},
			migrate: (context: MigrationContextShowStyle) => {
				const variant = context.getVariant(key)
				if (!variant) {
					const region = showVariants[key]

					context.insertVariant(key, {
						name: region.name
					})

					// Set/update config fields here
					// context.setVariantConfig(key, 'RegionCode', region.regionCode)
				}
			}
		})
	})
}
