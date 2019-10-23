import * as objectPath from 'object-path'
import {
	ConfigItemValue,
	ConfigManifestEntry,
	ConfigManifestEntryType,
	NotesContext,
	ShowStyleContext,
	TableConfigItemValue
} from 'tv-automation-sofie-blueprints-integration'
import * as _ from 'underscore'
import { assertUnreachable } from '../../common/util'
import { CORE_INJECTED_KEYS, MediaPlayerType, studioConfigManifest } from '../config-manifests'
import { parseMediaPlayers, parseSources, SourceInfo } from './sources'

export type MediaPlayerConfig = Array<{ id: string; val: string }>

export interface BlueprintConfig {
	studio: StudioConfig
	sources: SourceInfo[]
	mediaPlayers: MediaPlayerConfig // Atem Input Ids
}

export interface StudioConfig {
	// Injected by core
	SofieHostURL: string

	// Must override

	// Intended overrides
	MediaFlowId: string
	SourcesCam: string
	SourcesRM: string
	SourcesSkype: string
	HyperdeckCount: number
	ABMediaPlayers: string
	MediaPlayerType: MediaPlayerType

	AtemSource: {
		DSK1F: number
		DSK1K: number
		DSK2F: number
		DSK2K: number
		ServerC: number // Studio

		SplitArtF: number // Atem MP1 Fill
		SplitArtK: number // Atem MP1 Key

		Default: number
	}

	// Dev overrides

	// Constants
	CasparOutputDelay: number
}

export function applyToConfig(
	context: NotesContext,
	config: any,
	manifest: ConfigManifestEntry[],
	sourceName: string,
	overrides: { [key: string]: ConfigItemValue }
) {
	_.each(manifest, (val: ConfigManifestEntry) => {
		let newVal = val.defaultVal

		const overrideVal = overrides[val.id] as ConfigItemValue | undefined
		if (overrideVal !== undefined) {
			switch (val.type) {
				case ConfigManifestEntryType.BOOLEAN:
					newVal = overrideVal as boolean
					break
				case ConfigManifestEntryType.NUMBER:
					newVal = overrideVal as number
					break
				case ConfigManifestEntryType.STRING:
					newVal = overrideVal as string
					break
				case ConfigManifestEntryType.ENUM:
					newVal = overrideVal as string
					break
				case ConfigManifestEntryType.TABLE:
					newVal = overrideVal as TableConfigItemValue
					break
				default:
					assertUnreachable(val)
					context.warning('Unknown config field type: ' + val)
					break
			}
		} else if (val.required) {
			context.warning(`Required config not defined in ${sourceName}: "${val.name}"`)
		}

		objectPath.set(config, val.id, newVal)
	})
}

export function defaultStudioConfig(context: NotesContext): BlueprintConfig {
	const config: BlueprintConfig = {
		studio: {} as any,
		// showStyle: {} as any,
		sources: [],
		mediaPlayers: []
	}

	// Load values injected by core, not via manifest
	_.each(CORE_INJECTED_KEYS, (id: string) => {
		// Use the key as the value. Good enough for now
		objectPath.set(config.studio, id, id)
	})

	// Load the config
	applyToConfig(context, config.studio, studioConfigManifest, 'Studio', {})
	// applyToConfig(context, config.showStyle, showStyleConfigManifest, 'ShowStyle', {})

	config.sources = parseSources(context, config.studio)
	config.mediaPlayers = parseMediaPlayers(context, config.studio)

	return config
}

export function parseStudioConfig(context: ShowStyleContext): BlueprintConfig {
	const config: BlueprintConfig = {
		studio: {} as any,
		// showStyle: {} as any,
		sources: [],
		mediaPlayers: []
	}

	// Load values injected by core, not via manifest
	const studioConfig = context.getStudioConfig()
	_.each(CORE_INJECTED_KEYS, (id: string) => {
		objectPath.set(config.studio, id, studioConfig[id])
	})

	// Load the config
	applyToConfig(context, config.studio, studioConfigManifest, 'Studio', studioConfig)
	// applyToConfig(context, config.showStyle, showStyleConfigManifest, 'ShowStyle', context.getShowStyleConfig())

	config.sources = parseSources(context, config.studio)
	config.mediaPlayers = parseMediaPlayers(context, config.studio)

	return config
}
