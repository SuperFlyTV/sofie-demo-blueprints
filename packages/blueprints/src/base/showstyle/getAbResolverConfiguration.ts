import {
	ABPlayerDefinition,
	ABResolverConfiguration,
	IShowStyleContext,
} from '@sofie-automation/blueprints-integration'
import { CasparCGLayers } from '../studio/layers.js'
import {
	getOBSInputAudioLayer,
	getOBSInputMediaLayer,
	getOBSInputSettingsLayer,
} from '../studio/applyConfig/mappings/obs.js'

// This is a very basic implementation of the ABResolverConfiguration:
export function getAbResolverConfiguration(_context: IShowStyleContext): ABResolverConfiguration {
	const player1: ABPlayerDefinition = {
		playerId: 'casparcg_clip_player1',
	}
	const player2: ABPlayerDefinition = {
		playerId: 'casparcg_clip_player2',
	}
	return {
		resolverOptions: {
			idealGapBefore: 1000,
			nowWindow: 2000,
		},
		pools: {
			clip: [player1, player2],
		},
		timelineObjectLayerChangeRules: {
			[CasparCGLayers.CasparCGClipPlayer1]: {
				acceptedPoolNames: ['clip'],
				newLayerName: (playerId) => `${playerId}`,
				allowsLookahead: true,
			},
			[getOBSInputSettingsLayer('mediaplayer1')]: {
				acceptedPoolNames: ['clip'],
				newLayerName: (playerId) =>
					getOBSInputSettingsLayer(`${playerId}`.replace('casparcg_clip_player', 'mediaplayer')),
				allowsLookahead: true,
			},
			[getOBSInputMediaLayer('mediaplayer1')]: {
				acceptedPoolNames: ['clip'],
				newLayerName: (playerId) => getOBSInputMediaLayer(`${playerId}`.replace('casparcg_clip_player', 'mediaplayer')),
				allowsLookahead: true,
			},
			[getOBSInputAudioLayer('mediaplayer1')]: {
				acceptedPoolNames: ['clip'],
				newLayerName: (playerId) => getOBSInputAudioLayer(`${playerId}`.replace('casparcg_clip_player', 'mediaplayer')),
				allowsLookahead: true,
			},
		},
	}
}
