import {
	BlueprintManifestType,
	JSONBlobStringify,
	ShowStyleBlueprintManifest,
} from '@sofie-automation/blueprints-integration'
import { executeAction } from './executeActions'
import { getSegment } from './getSegment'
import { getShowStyleVariantId } from './getShowStyleVariantId'
// import { showStyleMigrations } from './migrations'
import { getRundown } from './rundown'
import OutputLayerDefaults from './migrations/outputlayer-defaults'
import SourceLayerDefaults from './migrations/sourcelayer-defaults'
import { TriggeredActionsDefaults } from './migrations/triggered-actions-defaults'
import ConfigSchema = require('./config-schema.json')

declare const VERSION: string // Injected by webpack
declare const VERSION_TSR: string // Injected by webpack
declare const VERSION_INTEGRATION: string // Injected by webpack
declare const TRANSLATION_BUNDLES: string // injected by webpack

const manifest: ShowStyleBlueprintManifest = {
	blueprintType: BlueprintManifestType.SHOWSTYLE,

	blueprintId: 'sofie-showstyle0',
	blueprintVersion: VERSION,
	integrationVersion: VERSION_INTEGRATION,
	TSRVersion: VERSION_TSR,

	getShowStyleVariantId,
	getRundown,
	getSegment,
	executeAction,

	showStyleConfigSchema: JSONBlobStringify(ConfigSchema),
	configPresets: {
		default: {
			name: 'Default',
			config: {
				dvePresets: {},
			},
			variants: {
				default: {
					name: 'Default',
					config: {},
				},
			},
		},
	},
	validateConfig: () => [],
	applyConfig: () => ({
		sourceLayers: SourceLayerDefaults,
		outputLayers: OutputLayerDefaults,
		triggeredActions: TriggeredActionsDefaults,
	}),

	translations: TRANSLATION_BUNDLES,
}

export default manifest
