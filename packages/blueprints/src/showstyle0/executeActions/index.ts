import {
	ActionUserData,
	BlueprintPlayoutPersistentStore,
	IActionExecutionContext,
} from '@sofie-automation/blueprints-integration'
import { ActionId } from '../actionDefinitions'
import { SourceLayer } from '../layers'

export async function executeAction(
	context: IActionExecutionContext,
	playoutPersistentState: BlueprintPlayoutPersistentStore<unknown>,
	actionId0: string,
	userData: ActionUserData,
	triggerMode?: string,
	privateData?: unknown,
	publicData?: unknown,
	actionOptions?: { [key: string]: any }
): Promise<void> {
	const actionId = actionId0 as ActionId

	console.log(
		'executeAction',
		actionId,
		userData,
		triggerMode,
		privateData,
		publicData,
		actionOptions,
		playoutPersistentState
	)

	if (actionId === ActionId.LastRemote) {
		await executeLastOnSourceLayer(context, SourceLayer.Remote)
	} else if (actionId === ActionId.LastDVE) {
		await executeLastOnSourceLayer(context, SourceLayer.DVE)
	}
}

async function executeLastOnSourceLayer(context: IActionExecutionContext, sourceLayer: SourceLayer) {
	const lastRemote = await context.findLastPieceOnLayer(sourceLayer)
	if (lastRemote) {
		// const partInstance = context.getPartInstance('current')
		const piece = {
			...lastRemote.piece,
			enable: {
				start: 'now' as const, // scrap timing
			},
		}

		await context.insertPiece('current', piece)
	} else {
		context.notifyUserWarning('No piece was found to replay')
		context.logWarning(`No last piece found on layer ${sourceLayer}`)
	}
}
