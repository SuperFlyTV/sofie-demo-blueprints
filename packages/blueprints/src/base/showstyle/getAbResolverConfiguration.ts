import {
	ABPlayerDefinition,
	ABResolverConfiguration,
	IShowStyleContext,
} from '@sofie-automation/blueprints-integration'

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
	}
}
