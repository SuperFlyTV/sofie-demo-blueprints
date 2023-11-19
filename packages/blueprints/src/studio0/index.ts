import {
	BlueprintManifestType,
	JSONBlobStringify,
	StudioBlueprintManifest,
} from '@sofie-automation/blueprints-integration'
import { getBaseline } from './getBaseline'
import { getShowStyleId } from './getShowStyleId'
// import { studioMigrations } from './migrations'
import ConfigSchema = require('./config-schema.json')
import DefaultMappings, { AtemMappings } from './migrations/mappings-defaults'

declare const VERSION: string // Injected by webpack
declare const VERSION_TSR: string // Injected by webpack
declare const VERSION_INTEGRATION: string // Injected by webpack
declare const TRANSLATION_BUNDLES: string // injected by webpack

const manifest: StudioBlueprintManifest = {
	blueprintType: BlueprintManifestType.STUDIO,

	blueprintId: 'sofie-generic-studio',
	blueprintVersion: VERSION,
	integrationVersion: VERSION_INTEGRATION,
	TSRVersion: VERSION_TSR,

	studioConfigSchema: JSONBlobStringify(ConfigSchema),
	configPresets: {
		default: {
			name: 'Default',
			config: {
				sisyfosSources: {},
				vmixSources: {},
				atemOutputs: {},
				atemSources: {},
			},
		},
	},
	studioMigrations: [],
	validateConfig: () => [],
	applyConfig: () => ({
		ingestDevices: {},
		inputDevices: {},
		mappings: {
			...DefaultMappings,
			...AtemMappings,
		},
		playoutDevices: {},
	}),

	getBaseline,
	getShowStyleId,

	translations: TRANSLATION_BUNDLES,
}

export default manifest
