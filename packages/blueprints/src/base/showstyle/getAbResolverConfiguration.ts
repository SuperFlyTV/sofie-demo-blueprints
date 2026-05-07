import {
	ABPlayerDefinition,
	ABResolverConfiguration,
	IShowStyleContext,
} from '@sofie-automation/blueprints-integration'
import { VisionMixerDevice } from '../studio/helpers/config.js'
import { CasparCGLayers } from '../studio/layers.js'
import {
	getOBSInputAudioABPendingLayer,
	getOBSInputMediaABPendingLayer,
	getOBSInputSettingsABPendingLayer,
	getOBSInputAudioLayer,
	getOBSInputMediaLayer,
	getOBSInputSettingsLayer,
} from '../studio/applyConfig/mappings/obs.js'
import { parseConfig } from './helpers/config.js'
import { getOBSClipPlayerSourceIds } from './helpers/clips.js'

export function getAbResolverConfiguration(context: IShowStyleContext): ABResolverConfiguration {
	const config = parseConfig(context).studio

	const isOBS = config.visionMixer.type === VisionMixerDevice.OBS
	const obsClipPlayerSourceIds = isOBS ? getOBSClipPlayerSourceIds(config) : []

	const players: ABPlayerDefinition[] =
		obsClipPlayerSourceIds.length > 0
			? obsClipPlayerSourceIds.map((sourceId) => ({ playerId: sourceId }))
			: [{ playerId: CasparCGLayers.CasparCGClipPlayer1 }, { playerId: CasparCGLayers.CasparCGClipPlayer2 }]

	return {
		resolverOptions: {
			idealGapBefore: 1000,
			nowWindow: 8000,
		},
		pools: {
			clip: players,
		},
		timelineObjectLayerChangeRules: {
			[CasparCGLayers.CasparCGClipPlayerAbPending]: {
				acceptedPoolNames: ['clip'],
				newLayerName: (playerId) => String(playerId),
				allowsLookahead: true,
			},
			[getOBSInputSettingsABPendingLayer()]: {
				acceptedPoolNames: ['clip'],
				newLayerName: (playerId) => getOBSInputSettingsLayer(String(playerId)),
				allowsLookahead: true,
			},
			[getOBSInputMediaABPendingLayer()]: {
				acceptedPoolNames: ['clip'],
				newLayerName: (playerId) => getOBSInputMediaLayer(String(playerId)),
				allowsLookahead: true,
			},
			[getOBSInputAudioABPendingLayer()]: {
				acceptedPoolNames: ['clip'],
				newLayerName: (playerId) => getOBSInputAudioLayer(String(playerId)),
				allowsLookahead: true,
			},
		},
	}
}
