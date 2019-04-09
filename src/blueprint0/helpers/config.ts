import * as _ from 'underscore'
import * as objectPath from 'object-path'

import { ShowStyleContext, ConfigManifestEntryType, ConfigManifestEntry, ConfigItemValue } from 'tv-automation-sofie-blueprints-integration'
import { StudioConfigManifest, ShowStyleConfigManifest, CoreInjectedKeys } from '../config-manifests'

export interface BlueprintConfig {
	studio: StudioConfig
	showStyle: ShowStyleConfig
}

export interface ShowStyleConfig {
}

export interface StudioConfig {
	// Injected by core
	SofieHostURL: string

	// Must override

	// Intended overrides
	MediaFlowId: string
	SourcesCam: string
	HyperdeckCount: number

	AtemSource: {
		DSK1F: number
		DSK1K: number
		DSK2F: number
		DSK2K: number
		Server1: number // Clips
		Server1Next: number
		Server2: number // Grafikk
		Server3: number // Studio

		SplitArtF: number // Atem MP1 Fill
		SplitArtK: number // Atem MP1 Key

		Default: number
	}

	// Dev overrides

	// Constants
	LawoFadeInDuration: number
	CasparOutputDelay: number
}

export function parseConfig (context: ShowStyleContext): BlueprintConfig {
	const applyToConfig = (config: any, manifest: ConfigManifestEntry[], sourceName: string, overrides: { [key: string]: ConfigItemValue }) => {
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
					default:
						context.warning('Unknown config field type: ' + val.type)
						break
				}
			} else if (val.required) {
				context.warning(`Required config not defined in ${sourceName}: "${val.name}"`)
			}

			objectPath.set(config, val.id, newVal)
		})
	}

	const config: BlueprintConfig = {
		studio: {} as any,
		showStyle: {} as any
	}

	// Load values injected by core, not via manifest
	const studioConfig = context.getStudioConfig()
	_.each(CoreInjectedKeys, (id: string) => {
		objectPath.set(config.studio, id, studioConfig[id])
	})

	// Load the config
	applyToConfig(config.studio, StudioConfigManifest, 'Studio', studioConfig)
	applyToConfig(config.showStyle, ShowStyleConfigManifest, 'ShowStyle', context.getShowStyleConfig())

	return config
}
