import { BlueprintManifestType, StudioBlueprintManifest } from 'tv-automation-sofie-blueprints-integration'
import * as _ from 'underscore'
import { getBaseline } from './getBaseline'
import { getShowStyleId } from './getShowStyleId'

declare const VERSION: string // Injected by webpack
declare const VERSION_TSR: string // Injected by webpack
declare const VERSION_INTEGRATION: string // Injected by webpack

const manifest: StudioBlueprintManifest = {
	blueprintType: BlueprintManifestType.STUDIO,

	blueprintVersion: VERSION,
	integrationVersion: VERSION_INTEGRATION,
	TSRVersion: VERSION_TSR,

	minimumCoreVersion: '1.0.0',

	studioConfigManifest: [], // TODO - some config should be moved here
	studioMigrations: [], // TODO - device migrations should be moved to be done here

	getBaseline,
	getShowStyleId
}

export default manifest
