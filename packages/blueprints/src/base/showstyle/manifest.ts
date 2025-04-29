import {
	BlueprintManifestType,
	ShowStyleBlueprintManifest,
	JSONBlobStringify,
	JSONSchema,
} from '@sofie-automation/blueprints-integration'
import { executeAction, executeDataStoreAction } from './executeActions/index.js'
import { getAdlibItem } from './getAdlibItem.js'
import { getSegment } from './getSegment.js'
import { getShowStyleVariantId } from './getShowStyleVariantId.js'
import { ShowStyleConfig } from './helpers/config.js'
import { getRundown } from './rundown/index.js'
import { validateConfig } from './validateConfig.js'
import { applyConfig } from './applyconfig/index.js'
import * as ConfigSchema from '../../$schemas/main-showstyle-config.json'

declare const VERSION: string // Injected by webpack
declare const VERSION_TSR: string // Injected by webpack
declare const VERSION_INTEGRATION: string // Injected by webpack
declare const TRANSLATION_BUNDLES: string // injected by webpack

export const baseManifest: Omit<ShowStyleBlueprintManifest<ShowStyleConfig>, 'blueprintId' | 'configPresets'> = {
	blueprintType: BlueprintManifestType.SHOWSTYLE,

	blueprintVersion: VERSION,
	integrationVersion: VERSION_INTEGRATION,
	TSRVersion: VERSION_TSR,

	showStyleConfigSchema: JSONBlobStringify<JSONSchema>(ConfigSchema as any),

	getShowStyleVariantId,
	getRundown,
	getSegment,
	getAdlibItem,
	executeAction,
	executeDataStoreAction,

	translations: TRANSLATION_BUNDLES,

	validateConfig,
	applyConfig,
}
