import {
	BlueprintManifestType,
	ShowStyleBlueprintManifest,
	JSONBlobStringify,
	JSONSchema,
	IRundownActivationContext,
	IOnTakeContext,
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
	onRundownActivate: async (context: IRundownActivationContext) => {
		context.clearAllTimers()

		const t = context.getTimer(1)
		t.setLabel('Test 123')
		t.startFreeRun()
	},
	onRundownDeActivate: async (context: IRundownActivationContext) => {
		context.clearAllTimers()
	},
	onTake: async (context: IOnTakeContext) => {
		const [currentSegment, nextSegment] = await Promise.all([context.getSegment('current'), context.getSegment('next')])
		if (!currentSegment) return // Bad state

		const hasSegmentChanged = !currentSegment || currentSegment._id !== nextSegment._id

		if (hasSegmentChanged) {
			// Recreate timer if segment has changed
			const t = context.getTimer(1)
			t.startTimeOfDay(context.getCurrentTime() + 10000) // Not a real usecase, just an example
		}
	},
	// fixUpConfig: () => {
	// 	// Noop
	// },
}
