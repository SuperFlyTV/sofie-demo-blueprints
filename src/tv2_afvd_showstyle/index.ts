import { BlueprintManifestType, ShowStyleBlueprintManifest } from 'tv-automation-sofie-blueprints-integration'
import { showStyleConfigManifest } from './config-manifests'
import { showStyleMigrations } from './migrations'

import { onTimelineGenerate } from '../tv2_afvd_studio/onTimelineGenerate'
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
	onTimelineGenerate,

	showStyleConfigManifest,
	showStyleMigrations,

	studioConfigManifest: [], // Should not be used
	studioMigrations: [] // Should not be used
}

export default manifest
