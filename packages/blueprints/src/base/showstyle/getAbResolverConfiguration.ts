import {
	ABPlayerDefinition,
	AbPlayerId,
	ABResolverConfiguration,
	BlueprintMappings,
	ICommonContext,
	IShowStyleContext,
	OnGenerateTimelineObj,
	TSR,
} from '@sofie-automation/blueprints-integration'
import { AtemLayers } from '../studio/layers.js'

interface ABPlayerDefinitions {
	player1: ABPlayerDefinition
	player2: ABPlayerDefinition
}

// This is a very basic implementation of the ABResolverConfiguration:
export function getAbResolverConfiguration(context: IShowStyleContext): ABResolverConfiguration {
	const players: ABPlayerDefinitions = {
		player1: {
			playerId: 'casparcg_clip_player1',
		},
		player2: {
			playerId: 'casparcg_clip_player2',
		},
	}
	const atemMediaPlayerMapping = context.getStudioMappings()

	return {
		resolverOptions: {
			idealGapBefore: 1000,
			nowWindow: 2000,
		},
		pools: {
			clip: [players.player1, players.player2],
		},
		timelineObjectLayerChangeRules: {
			// Objects on this "pending" layer will be moved to actual player layers
			['casparcg_clip_player_ab_pending']: {
				acceptedPoolNames: ['clip'],
				newLayerName: (playerId: AbPlayerId) => `casparcg_clip_player${playerId}`,
				allowsLookahead: true,
			},
		},
		customApplyToObject: (
			_context: ICommonContext,
			poolName: string,
			playerId: AbPlayerId,
			timelineObject: OnGenerateTimelineObj<TSR.TSRTimelineContent>
		): boolean => {
			// Handle ATEM input switching based on AB player assignment
			_context.logDebug(
				'------------------------------------ Resolving Atem AB input ---------------------------------------------'
			)
			_context.logInfo(
				`ABResolver: Assigning player ${playerId} to ATEM Media Player input for timeline object ${timelineObject.id}`
			)
			_context.logDebug('Atem Media Player Mapping:' + JSON.stringify(atemMediaPlayerMapping, null, 2))
			if (poolName === 'clip' && timelineObject.layer === AtemLayers.AtemMeProgram) {
				const content = timelineObject.content as TSR.TimelineContentAtemME

				if (content && content.me && typeof content.me === 'object') {
					// Get the appropriate media player input based on the assigned player
					const mediaPlayerInput = getMediaPlayerInputForPlayer(playerId, players, atemMediaPlayerMapping)
					if (mediaPlayerInput !== undefined) {
						content.me.input = mediaPlayerInput
						return true
					}
				}
			}
			// Some error handling or logging shoule be added here
			return false
		},
	}
}

function getMediaPlayerInputForPlayer(
	playerId: AbPlayerId,
	players: ABPlayerDefinitions,
	_mappings: Readonly<BlueprintMappings>
): number | undefined {
	// This function maps the AB player to the correct ATEM media player input
	if (playerId === players.player1.playerId) {
		// Return the ATEM input number for MediaPlayer 1
		return 99999999999 //mappings.mediaPlayer1.input
	} else if (playerId === players.player2.playerId) {
		// Return the ATEM input number for MediaPlayer 2
		return 888888888888 // mappings.mediaPlayer2.input
	}

	return undefined
}
