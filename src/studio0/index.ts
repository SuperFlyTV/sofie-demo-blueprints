import { BlueprintManifestType, StudioBlueprintManifest } from '@sofie-automation/blueprints-integration'
import { studioConfigManifest } from './config-manifests'
import { getBaseline } from './getBaseline'
import { getShowStyleId } from './getShowStyleId'
import { studioMigrations } from './migrations'

declare const VERSION: string // Injected by webpack
declare const VERSION_TSR: string // Injected by webpack
declare const VERSION_INTEGRATION: string // Injected by webpack
declare const TRANSLATION_BUNDLES: string // injected by webpack

const manifest: StudioBlueprintManifest = {
	blueprintType: BlueprintManifestType.STUDIO,

	blueprintId: 'sofie-generic-studio',
	blueprintVersion: VERSION,
	integrationVersion: VERSION_INTEGRATION,
	TSRVersion: VERSION_TSR,

	studioConfigManifest,
	studioMigrations,

	getBaseline,
	getShowStyleId,

	translations: TRANSLATION_BUNDLES,
}

export default manifest
