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

declare const __VERSION__: string // Injected by webpack
declare const __VERSION_TSR__: string // Injected by webpack
declare const __VERSION_INTEGRATION__: string // Injected by webpack
declare const __TRANSLATION_BUNDLES__: string // injected by webpack

export const baseManifest: Omit<ShowStyleBlueprintManifest<ShowStyleConfig>, 'blueprintId' | 'configPresets'> = {
	blueprintType: BlueprintManifestType.SHOWSTYLE,

	blueprintVersion: __VERSION__,
	integrationVersion: __VERSION_INTEGRATION__,
	TSRVersion: __VERSION_TSR__,

	showStyleConfigSchema: JSONBlobStringify<JSONSchema>(ConfigSchema as any),

	getShowStyleVariantId,
	getRundown,
	getSegment,
	getAdlibItem,
	executeAction,
	executeDataStoreAction,

	translations: __TRANSLATION_BUNDLES__,

	validateConfig,
	applyConfig,
}
