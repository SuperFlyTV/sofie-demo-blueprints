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
import { StudioConfig, VisionMixerType } from './helpers/config.js'
import { processIngestData } from './userEditOperations/processIngestData.js'

declare const VERSION: string // Injected by webpack
declare const VERSION_TSR: string // Injected by webpack
declare const VERSION_INTEGRATION: string // Injected by webpack
declare const TRANSLATION_BUNDLES: string // injected by webpack

export const baseManifest: StudioBlueprintManifest<StudioConfig> = {
	blueprintType: BlueprintManifestType.STUDIO,

	blueprintVersion: VERSION,
	integrationVersion: VERSION_INTEGRATION,
	TSRVersion: VERSION_TSR,

	studioConfigSchema: JSONBlobStringify<JSONSchema>(ConfigSchema as any),

	getBaseline,
	getShowStyleId,

	/* function to group rundowns into playlists
	 * When commented out, there will be no grouping
	 */
	//getRundownPlaylistInfo,

	validateConfig,
	applyConfig,
	preprocessConfig,
	processIngestData,
	configPresets: {
		default: {
			name: 'Default',
			config: {
				previewRenderer: 'sofie',
				casparcgLatency: 0,
				visionMixerType: VisionMixerType.Atem,
				sisyfosSources: {},
				vmixSources: {},
				atemOutputs: {},
				atemSources: {},
			},
		},
	},
	translations: TRANSLATION_BUNDLES,
}

export default baseManifest
