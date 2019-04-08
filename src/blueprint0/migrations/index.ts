import * as _ from 'underscore'
import {
	MigrationStepShowStyle,
	MigrationStepStudio
} from 'tv-automation-sofie-blueprints-integration'
import { literal } from '../../common/util'
import {
	ensureStudioConfig,
	getMappingsDefaultsMigrationSteps,
	getSourceLayerDefaultsMigrationSteps,
	getOutputLayerDefaultsMigrationSteps,
	getRuntimeArgumentsDefaultsMigrationSteps
} from './util'
import { deviceMigrations } from './devices'
import { getCreateVariantMigrationSteps } from './variants-defaults'

declare const VERSION: string // Injected by webpack

/**
 * Versions:
 * 0.1.0: Core 0.24.0
 */

export const studioMigrations: MigrationStepStudio[] = literal<MigrationStepStudio[]>([
	ensureStudioConfig('0.1.0', 'SourcesCam', null, 'text', 'Studio config: Camera mappings',
		'Enter the Camera input mapping (example: "1:1,2:2,3:3,4:4"'),

	...deviceMigrations,
	// Fill in any mappings that did not exist before
	// Note: These should only be run as the very final step of all migrations. otherwise they will add items too early, and confuse old migrations
	...getMappingsDefaultsMigrationSteps(VERSION)
])

export const showStyleMigrations: MigrationStepShowStyle[] = literal<MigrationStepShowStyle[]>([

	// Fill in any layers that did not exist before
	// Note: These should only be run as the very final step of all migrations. otherwise they will add items too early, and confuse old migrations
	...getCreateVariantMigrationSteps(),
	...getSourceLayerDefaultsMigrationSteps(VERSION),
	...getOutputLayerDefaultsMigrationSteps(VERSION),
	...getRuntimeArgumentsDefaultsMigrationSteps(VERSION)
])
