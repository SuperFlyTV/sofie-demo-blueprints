import { BlueprintManifestType, ShowStyleBlueprintManifest } from '@sofie-automation/blueprints-integration'
import { showStyleConfigManifest } from './config-manifests'
import { getSegment } from './getSegment'
import { getShowStyleVariantId } from './getShowStyleVariantId'
import { showStyleMigrations } from './migrations'
import { getRundown } from './rundown'

declare const VERSION: string // Injected by webpack
declare const VERSION_TSR: string // Injected by webpack
declare const VERSION_INTEGRATION: string // Injected by webpack
declare const TRANSLATION_BUNDLES: string // injected by webpack

const manifest: ShowStyleBlueprintManifest = {
	blueprintType: BlueprintManifestType.SHOWSTYLE,

	blueprintId: 'sofie-showstyle0',
	blueprintVersion: VERSION,
	integrationVersion: VERSION_INTEGRATION,
	TSRVersion: VERSION_TSR,

	getShowStyleVariantId,
	getRundown,
	getSegment,

	showStyleConfigManifest,
	showStyleMigrations,

	translations: TRANSLATION_BUNDLES,
}

export default manifest
