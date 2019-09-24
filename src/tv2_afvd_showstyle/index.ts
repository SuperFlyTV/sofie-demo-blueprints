import { BlueprintManifestType, ShowStyleBlueprintManifest } from 'tv-automation-sofie-blueprints-integration'
import { ShowStyleConfigManifest, StudioConfigManifest } from './config-manifests'
import { showStyleMigrations, studioMigrations } from './migrations'

import { getRundown, getShowStyleVariantId } from './getRundown'
import { getSegment } from './getSegment'
import onAsRunEvent from './onAsRunEvent'

declare const VERSION: string // Injected by webpack
declare const VERSION_TSR: string // Injected by webpack
declare const VERSION_INTEGRATION: string // Injected by webpack

const manifest: ShowStyleBlueprintManifest = {
	blueprintType: BlueprintManifestType.SHOWSTYLE,

	blueprintVersion: VERSION,
	integrationVersion: VERSION_INTEGRATION,
	TSRVersion: VERSION_TSR,

	minimumCoreVersion: '1.0.0',

	getShowStyleVariantId,
	getRundown,
	getSegment,

	onAsRunEvent,

	studioConfigManifest: StudioConfigManifest,
	showStyleConfigManifest: ShowStyleConfigManifest,
	studioMigrations,
	showStyleMigrations
}

export default manifest
