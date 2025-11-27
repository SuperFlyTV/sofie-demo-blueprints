import {
	BlueprintManifestType,
	ShowStyleBlueprintManifest,
	JSONBlobStringify,
	JSONSchema,
	IRundownActivationContext,
} from '@sofie-automation/blueprints-integration'
import { executeAction, executeDataStoreAction } from './executeActions/index.js'
import { getAdlibItem } from './getAdlibItem.js'
import { getSegment } from './getSegment.js'
import { getShowStyleVariantId } from './getShowStyleVariantId.js'
import { ShowStyleConfig } from './helpers/config.js'
import { getAbResolverConfiguration } from './getAbResolverConfiguration.js'
import { getRundown } from './rundown/index.js'
import { validateConfig } from './validateConfig.js'
import { applyConfig } from './applyconfig/index.js'
import * as ConfigSchema from '../../$schemas/main-showstyle-config.json'
import { dereferenceSync } from 'dereference-json-schema'

export const baseManifest: Omit<ShowStyleBlueprintManifest<ShowStyleConfig>, 'blueprintId' | 'configPresets'> = {
	blueprintType: BlueprintManifestType.SHOWSTYLE,

	blueprintVersion: __VERSION__,
	integrationVersion: __VERSION_INTEGRATION__,
	TSRVersion: __VERSION_TSR__,

	showStyleConfigSchema: JSONBlobStringify<JSONSchema>(
		dereferenceSync(JSON.parse(JSON.stringify(ConfigSchema))) as any
	),

	getShowStyleVariantId,
	getRundown,
	getSegment,
	getAdlibItem,
	executeAction,
	executeDataStoreAction,

	getAbResolverConfiguration,
	// translations: __TRANSLATION_BUNDLES__,

	validateConfig,
	applyConfig,
	onRundownActivate: async (_context: IRundownActivationContext) => {
		// Noop
	},
	fixUpConfig: () => {
		// Noop
	},
}
