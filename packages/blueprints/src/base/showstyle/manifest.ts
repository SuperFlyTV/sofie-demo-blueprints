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
	/** The type of this blueprint */
	blueprintType: BlueprintManifestType.SHOWSTYLE,

	/** Version of this blueprint */
	blueprintVersion: __VERSION__,
	/** Version of blueprints-integration that this blueprint depends on */
	integrationVersion: __VERSION_INTEGRATION__,
	/** Version of timeline-state-resolver-types that this blueprint depends on */
	TSRVersion: __VERSION_TSR__,

	/** A list of config items this blueprint expects to be available on the ShowStyle */
	showStyleConfigSchema: JSONBlobStringify<JSONSchema>(
		dereferenceSync(JSON.parse(JSON.stringify(ConfigSchema))) as any
	),

	/** Returns the id of the show style variant to use for a rundown, return null to ignore that rundown */
	getShowStyleVariantId,
	/** Generate rundown from ingest data. return null to ignore that rundown */
	getRundown,
	/** Generate segment from ingest data */
	getSegment,
	/** Generate adlib piece from ingest data */
	getAdlibItem,
	/** Execute an action defined by an IBlueprintActionManifest */
	executeAction,
	/**
	 * Execute an action defined by an IBlueprintActionManifest.
	 *
	 * This callback allows an action to perform operations only on the Timeline Datastore.
	 * This allows for a _fast-path_ for rapid-fire actions, before the full `executeAction` callback resolves.
	 */
	executeDataStoreAction,

	/** Called just before `onTimelineGenerate` to perform AB-playback for the timeline */
	getAbResolverConfiguration,
	// translations: __TRANSLATION_BUNDLES__,

	/**
	 * Validate the config passed to this blueprint.
	 * Do various sanity checks of the config and return a list of messages to display to the user.
	 */
	validateConfig,
	/**
	 * Apply the config by generating the data to be saved into the db.
	 * This should be written to give a predictable and stable result, it can be called with the same config multiple times.
	 */
	applyConfig,
	/** Called when a RundownPlaylist has been activated */
	onRundownActivate: async (_context: IRundownActivationContext) => {
		// Noop
	},
	// Uncomment this to enable config fixup migrations between blueprint versions.
	// Note: When defined, fixUpConfig must be run after every blueprint upload before
	// config can be validated/applied.
	// fixUpConfig: () => {
	// 	// Noop
	// },
}
