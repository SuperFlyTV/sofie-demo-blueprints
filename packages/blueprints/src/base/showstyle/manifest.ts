import {
	BlueprintManifestType,
	ShowStyleBlueprintManifest,
	JSONBlobStringify,
	JSONSchema,
} from '@sofie-automation/blueprints-integration'
import { executeAction, executeDataStoreAction } from './executeActions'
import { getAdlibItem } from './getAdlibItem'
import { getSegment } from './getSegment'
import { getShowStyleVariantId } from './getShowStyleVariantId'
import { ShowStyleConfig } from './helpers/config'
import { getRundown } from './rundown'
import { validateConfig } from './validateConfig'
import { applyConfig } from './applyconfig'
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
