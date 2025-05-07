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
import androidSvg from '../../../../../assets/android.svg'

console.log('ad2', androidSvg)

declare const __VERSION__: string // Injected by webpack
declare const __VERSION_TSR__: string // Injected by webpack
declare const __VERSION_INTEGRATION__: string // Injected by webpack
declare const __TRANSLATION_BUNDLES__: string // injected by webpack

export const baseManifest: StudioBlueprintManifest<StudioConfig> = {
	blueprintType: BlueprintManifestType.STUDIO,

	blueprintVersion: __VERSION__,
	integrationVersion: __VERSION_INTEGRATION__,
	TSRVersion: __VERSION_TSR__,

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
	translations: __TRANSLATION_BUNDLES__,
}

export default baseManifest
