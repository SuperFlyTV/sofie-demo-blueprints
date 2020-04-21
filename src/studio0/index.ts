import { StudioBlueprintManifest, BlueprintManifestType } from 'tv-automation-sofie-blueprints-integration'
import * as _ from 'underscore'
import { getBaseline } from './getBaseline'
import { getShowStyleId } from './getShowStyleId'
import { StudioConfigManifest } from '../blueprint0/config-manifests'
import { studioMigrations } from '../blueprint0/migrations'

declare const VERSION: string // Injected by webpack
declare const VERSION_TSR: string // Injected by webpack
declare const VERSION_INTEGRATION: string // Injected by webpack

const manifest: StudioBlueprintManifest = {
	blueprintType: BlueprintManifestType.STUDIO,

	blueprintVersion: VERSION,
	integrationVersion: VERSION_INTEGRATION,
	TSRVersion: VERSION_TSR,

	minimumCoreVersion: '^1.0.0',

	getBaseline: getBaseline,
	getShowStyleId: getShowStyleId,

	studioConfigManifest: StudioConfigManifest,
	studioMigrations: studioMigrations
}

export default manifest
