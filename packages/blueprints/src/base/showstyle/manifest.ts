import {
	BlueprintManifestType,
	ShowStyleBlueprintManifest,
	JSONBlobStringify,
	JSONSchema,
	IRundownActivationContext,
	PlaylistTimingType,
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
import type { ITTimersContext, RundownPlaylistTiming } from '@sofie-automation/blueprints-integration'

/**
 * Initialize or update Timer 2 (End of Show duration timer)
 * This is called both on activation and during ingest updates
 */
function setupTimer2(
	tTimerContext: ITTimersContext,
	timing: RundownPlaylistTiming,
	logDebug: (message: string) => void
): void {
	const timer2 = tTimerContext.getTimer(2)

	if (timing?.expectedDuration) {
		// Check if timer is already initialized
		if (timer2.mode?.type === 'countdown' && timer2.state) {
			// Timer exists - update if duration changed
			const origDuration = timer2.mode.duration
			if (origDuration !== timing.expectedDuration) {
				logDebug(`Expected duration changed from ${origDuration} to ${timing.expectedDuration}, updating timer`)
				timer2.setDuration({ original: timing.expectedDuration })
			}
		} else {
			// Timer doesn't exist - initialize it
			timer2.setLabel('End of Show (duration)')
			timer2.startCountdown(timing.expectedDuration, { startPaused: true })
			timer2.setProjectedAnchorPartByExternalId('end-of-rundown-break')
			logDebug(`Initialized timer 2 with duration ${timing.expectedDuration}`)
		}
	}
}

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
	onRundownActivate: async (context: IRundownActivationContext) => {
		const endOfShowTimer = context.getTimer(1)

		// Determine the expected end time from the rundown timing and start a countdown
		const timing = context.rundown.timing
		let expectedEnd: number | undefined
		if (timing && timing.type === PlaylistTimingType.BackTime) {
			expectedEnd = timing.expectedEnd
			endOfShowTimer.setLabel('End of Show (expected end, backtime)')
		} else if (timing && timing.type === PlaylistTimingType.ForwardTime) {
			if (timing.expectedEnd !== undefined) {
				expectedEnd = timing.expectedEnd
				endOfShowTimer.setLabel('End of Show (expected end, forward time)')
			} else if (timing.expectedDuration !== undefined) {
				expectedEnd = timing.expectedStart + timing.expectedDuration
				endOfShowTimer.setLabel('End of Show (expected duration, forward time)')
			}
		}

		if (expectedEnd !== undefined) {
			endOfShowTimer.startTimeOfDay(expectedEnd)
			// Set the anchor part for automatic projection calculation (over/under diff)
			endOfShowTimer.setProjectedAnchorPartByExternalId('end-of-rundown-break')
			context.logDebug(`Expected end time is ${expectedEnd}`)
		} else {
			context.logWarning('Expected end time is not defined for this rundown, end of show timer will not be started')
		}

		// Initialize or update timer 2 using shared logic
		setupTimer2(context, timing, (msg) => context.logDebug(msg))
	},
	onTake: async (context) => {
		// Ensure timer 2 is running
		context.getTimer(2).resume()
	},
	onRundownDeActivate: async (context) => {
		// Stop timers when rundown is deactivated
		context.getTimer(1).pause()
		context.getTimer(2).pause()
		context.getTimer(2).restart()
	},
	syncIngestUpdateToPartInstance: (context, _existingPartInstance, _newData, _playoutStatus) => {
		// Initialize or update timer 2 (will create it if it doesn't exist, or update if duration changed)
		const timing = context.rundown.timing
		setupTimer2(context, timing, (msg) => context.logDebug(msg))
	},
	// Uncomment this to enable config fixup migrations between blueprint versions.
	// Note: When defined, fixUpConfig must be run after every blueprint upload before
	// config can be validated/applied.
	// fixUpConfig: () => {
	// 	// Noop
	// },
}
