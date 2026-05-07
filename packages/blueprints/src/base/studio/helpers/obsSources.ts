import { ObsSourceConfig, SourceType, StudioConfig } from '../../../$schemas/generated/main-studio-config.js'

export function getOBSMediaPlayerSourceIds(config: StudioConfig): string[] {
	return Object.entries<ObsSourceConfig>(config.obsSources)
		.filter(([, source]) => source.type === SourceType.MediaPlayer)
		.map(([sourceId]) => sourceId)
}

export function getOBSClipMediaPlayerSourceIds(config: StudioConfig): string[] {
	const configuredIds = config.obsAbMediaPlayerSourceIds?.filter(Boolean) ?? []
	if (configuredIds.length > 0) return configuredIds

	const effectsSourceId = config.obsEffectsMediaPlayerSourceId?.trim()
	return getOBSMediaPlayerSourceIds(config).filter((sourceId) => sourceId !== effectsSourceId)
}

export function getOBSEffectsMediaPlayerSourceIds(config: StudioConfig): string[] {
	const effectsPlayerSourceId = config.obsEffectsMediaPlayerSourceId?.trim()
	if (effectsPlayerSourceId) return [effectsPlayerSourceId]

	return []
}
