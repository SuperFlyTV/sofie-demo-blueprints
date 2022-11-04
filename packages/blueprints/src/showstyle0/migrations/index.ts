import { MigrationContextShowStyle, MigrationStepShowStyle } from '@sofie-automation/blueprints-integration'
import * as _ from 'underscore'
import { literal } from '../../common/util'
import OutputLayerDefaults from './outputlayer-defaults'
import SourceLayerDefaults from './sourcelayer-defaults'
import { TriggeredActionsDefaults } from './triggered-actions-defaults'
import {
	getOutputLayerDefaultsMigrationSteps,
	getSourceLayerDefaultsMigrationSteps,
	getTriggeredActionsMigrationSteps,
} from './util'
import { variants } from './variants-defaults'

declare const VERSION: string // Injected by webpack

function getCreateVariantMigrationSteps(): MigrationStepShowStyle[] {
	return _.keys(variants).map((key) => {
		return literal<MigrationStepShowStyle>({
			id: `variant.${key}`,
			version: VERSION,
			canBeRunAutomatically: true,
			validate: (context: MigrationContextShowStyle) => {
				const variant = context.getVariant(key)
				if (!variant) {
					return `Variant "${key}" doesn't exist`
				}
				return false
			},
			migrate: (context: MigrationContextShowStyle) => {
				const variant = context.getVariant(key)
				if (!variant) {
					const variantDefaults = variants[key]

					context.insertVariant(key, {
						name: variantDefaults.name,
					})

					// Set other properties here
				}
			},
		})
	})
}

export const showStyleMigrations: MigrationStepShowStyle[] = literal<MigrationStepShowStyle[]>(
	_.compact([
		// Fill in any layers that did not exist before
		// Note: These should only be run as the very final step of all migrations. otherwise they will add items too early, and confuse old migrations
		...getCreateVariantMigrationSteps(),
		...getSourceLayerDefaultsMigrationSteps(VERSION, SourceLayerDefaults),
		...getOutputLayerDefaultsMigrationSteps(VERSION, OutputLayerDefaults),
		...getTriggeredActionsMigrationSteps(VERSION, TriggeredActionsDefaults),
	])
)
