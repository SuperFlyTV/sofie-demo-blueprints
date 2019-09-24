import { ShowStyleBlueprintManifest, BlueprintManifestType } from 'tv-automation-sofie-blueprints-integration'
import { StudioConfigManifest, ShowStyleConfigManifest } from './config-manifests'
import { studioMigrations, showStyleMigrations } from './migrations'

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

	getShowStyleVariantId: getShowStyleVariantId,
	getRundown: getRundown,
	getSegment: getSegment,

	onAsRunEvent: onAsRunEvent,

	studioConfigManifest: StudioConfigManifest,
	showStyleConfigManifest: ShowStyleConfigManifest,
	studioMigrations: studioMigrations,
	showStyleMigrations: showStyleMigrations
}

export default manifest
