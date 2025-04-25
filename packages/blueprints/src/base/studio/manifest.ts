import {
	BlueprintManifestType,
	JSONBlobStringify,
	JSONSchema,
	StudioBlueprintManifest,
} from '@sofie-automation/blueprints-integration'
import { getBaseline } from './getBaseline'
import { getShowStyleId } from './getShowStyleId'
import { validateConfig } from './validateConfig'
import { preprocessConfig } from './preprocessConfig'
import { getRundownPlaylistInfo } from './getRundownPlaylistInfo'
import { applyConfig } from './applyConfig'
import * as ConfigSchema from '../../$schemas/main-studio-config.json'
import { StudioConfig } from './helpers/config'

declare const VERSION: string // Injected by webpack
declare const VERSION_TSR: string // Injected by webpack
declare const VERSION_INTEGRATION: string // Injected by webpack
// declare const TRANSLATION_BUNDLES: string // injected by webpack

export const manifest: StudioBlueprintManifest<StudioConfig> = {
	blueprintType: BlueprintManifestType.STUDIO,

	blueprintVersion: VERSION,
	integrationVersion: VERSION_INTEGRATION,
	TSRVersion: VERSION_TSR,

	studioConfigSchema: JSONBlobStringify<JSONSchema>(ConfigSchema as any),

	getBaseline,
	getShowStyleId,

	getRundownPlaylistInfo,

	validateConfig,
	applyConfig,
	preprocessConfig,
	configPresets: {
		default: {
			name: 'Default',
			config: {
				previewRenderer: 'sofie',
				casparcgLatency: 0,
				visionMixerType: 'atem',
				sisyfosSources: {},
				vmixSources: {},
				atemOutputs: {},
				atemSources: {},
			},
		},
	},
}

export default manifest
