import {
	BlueprintManifestType,
	JSONBlobStringify,
	JSONSchema,
	StudioBlueprintManifest,
} from '@sofie-automation/blueprints-integration'
import { getBaseline } from './getBaseline.js'
import { getShowStyleId } from './getShowStyleId.js'
import { validateConfig } from './validateConfig.js'
import { preprocessConfig } from './preprocessConfig.js'
//import { getRundownPlaylistInfo } from './getRundownPlaylistInfo.js'
import { applyConfig } from './applyConfig/index.js'
import * as ConfigSchema from '../../$schemas/main-studio-config.json'
import { StudioConfig } from './helpers/config.js'
import { processIngestData } from './userEditOperations/processIngestData.js'
import { dereferenceSync } from 'dereference-json-schema'

export const baseManifest: Omit<StudioBlueprintManifest<StudioConfig>, 'blueprintId' | 'configPresets'> = {
	blueprintType: BlueprintManifestType.STUDIO,

	blueprintVersion: __VERSION__,
	integrationVersion: __VERSION_INTEGRATION__,
	TSRVersion: __VERSION_TSR__,

	studioConfigSchema: JSONBlobStringify<JSONSchema>(dereferenceSync(JSON.parse(JSON.stringify(ConfigSchema))) as any),

	getBaseline,
	getShowStyleId,

	/* function to group rundowns into playlists
	 * When commented out, there will be no grouping
	 */
	//getRundownPlaylistInfo,

	validateConfig,
	applyConfig,
	preprocessConfig,
	// procesIngestData is a "middleware" between the ingestDataCache and the sofieIngestDataCache
	// It is called for each Rundown, and can be used to modify the ingest data before it is sent to the blueprint
	// This is the place where UsedEditOperations and PropertiesPanel edits are processed:
	processIngestData,

	translations: __TRANSLATION_BUNDLES__,
}

export default baseManifest
