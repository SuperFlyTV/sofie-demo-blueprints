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
import { AtemStatusCode, CasparCGStatusCode, HttpSendActionErrorCode } from 'timeline-state-resolver-types'

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

	// Device status message customization - overrides default messages from TSR devices
	deviceStatusMessages: {
		[AtemStatusCode.DISCONNECTED]: '🎬 Vision mixer {{deviceName}} ran away! 🏃‍♂️💨 (Check the ATEM connection)',
		[AtemStatusCode.PSU_FAULT]: '⚡ {{deviceName}}: Power supply {{psuNumber}} is faulty - check hardware',
		[CasparCGStatusCode.QUEUE_OVERFLOW]: '{{deviceName}} needs restart - CasparCG command queue is full',
	},

	// Device action error message customization - overrides default messages when TSR device actions fail
	deviceActionMessages: {
		// Network failure: show the URL so operators know which endpoint is unreachable
		[HttpSendActionErrorCode.REQUEST_FAILED]: 'HTTP action failed - could not reach {{url}}: {{errorMessage}}',
		// Config errors: friendlier messages than the raw TSR defaults
		[HttpSendActionErrorCode.MISSING_URL]: 'HTTP action not configured - no URL set in the timeline object',
		[HttpSendActionErrorCode.INVALID_TYPE]: 'HTTP action has invalid method "{{type}}" - check blueprint config',
	},
}

export default baseManifest
