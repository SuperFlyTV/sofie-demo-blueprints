import { MigrationStepStudio } from 'tv-automation-sofie-blueprints-integration'
import * as _ from 'underscore'
import { literal } from '../../common/util'
import { deviceMigrations } from './devices'
import { ensureStudioConfig, getMappingsDefaultsMigrationSteps } from './util'

declare const VERSION: string // Injected by webpack

/**
 * Versions:
 * 0.1.0: Core 0.24.0
 */

export const studioMigrations: MigrationStepStudio[] = literal<MigrationStepStudio[]>([
	ensureStudioConfig(
		'0.1.0',
		'SourcesCam',
		null,
		'text',
		'Studio config: Camera mappings',
		'Enter the Camera input mapping (example: "1:1,2:2,3:3,4:4"'
	),
	ensureStudioConfig(
		'0.1.0',
		'ABMediaPlayers',
		null,
		'text',
		'Studio config: Media player inputs',
		'Enter the Media player inputs (example: "1:17,2:18,3:19")',
		'1:17,2:18'
	),

	...deviceMigrations,
	// Fill in any mappings that did not exist before
	// Note: These should only be run as the very final step of all migrations. otherwise they will add items too early, and confuse old migrations
	...getMappingsDefaultsMigrationSteps(VERSION)
])
