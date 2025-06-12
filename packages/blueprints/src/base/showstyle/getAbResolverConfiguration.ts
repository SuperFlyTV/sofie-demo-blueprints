import {
	ABPlayerDefinition,
	AbPlayerId,
	ABResolverConfiguration,
	ICommonContext,
	IShowStyleContext,
	OnGenerateTimelineObj,
	TSR,
} from '@sofie-automation/blueprints-integration'
import { CasparCGLayers } from '../studio/layers.js'

interface ABPlayerDefinitions {
	player1: ABPlayerDefinition
	player2: ABPlayerDefinition
}

// This is a very basic implementation of the ABResolverConfiguration:
export function getAbResolverConfiguration(context: IShowStyleContext): ABResolverConfiguration {
	const players: ABPlayerDefinitions = {
		player1: {
			playerId: CasparCGLayers.CasparCGClipPlayer1,
		},
		player2: {
			playerId: CasparCGLayers.CasparCGClipPlayer2,
		},
	}

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
			[CasparCGLayers.CasparCGClipPlayerAbPending]: {
				acceptedPoolNames: ['clip'],
				// ToDo - use the CasparCGClipPlayer1+2 instead of hardcoding the string with player IDs
				newLayerName: (playerId: AbPlayerId) => {
					context.logDebug(`ABResolver: Changing layer to player ${playerId}}`)
					return String(playerId)
				},
				allowsLookahead: true,
			},
		},
		customApplyToObject: (
			context: ICommonContext,
			poolName: string,
			playerId: AbPlayerId,
			timelineObject: OnGenerateTimelineObj<TSR.TSRTimelineContent>
		): boolean => {
			// Handle special cases for manipulating
			context.logDebug('running customApplyToObjec')
			context.logInfo(`AB customApplyToObject: ${playerId} for timeline object ${timelineObject.id}`)
			context.logInfo(`AB customApplyToObject: Pool name: ${poolName}`)
			if (poolName === 'clip' && timelineObject.lookaheadForLayer === CasparCGLayers.CasparCGClipPlayer1) {
				// Here you can add
			}
			// Some error handling or logging shoule be added here
			return false
		},
	}
}
