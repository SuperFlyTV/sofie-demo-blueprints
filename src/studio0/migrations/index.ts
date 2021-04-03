import { MigrationStepStudio } from '@sofie-automation/blueprints-integration'
import { literal } from '../../common/util'
import { deviceMigrations } from './devices'
import { getMappingsDefaultsMigrationSteps } from './util'

declare const VERSION: string // Injected by webpack

/**
 * Versions: See README.md for list of versions vs releases
 */

export const studioMigrations: MigrationStepStudio[] = literal<MigrationStepStudio[]>([
	// Ensure required config values are defined
	...deviceMigrations,
	// Fill in any mappings that did not exist before
	// Note: These should only be run as the very final step of all migrations. otherwise they will add items too early, and confuse old migrations
	...getMappingsDefaultsMigrationSteps(VERSION),
])
