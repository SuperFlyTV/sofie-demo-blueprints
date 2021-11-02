import { ActionUserData, IActionExecutionContext } from '@sofie-automation/blueprints-integration'
import { ActionId } from '../actionDefinitions'
import { SourceLayer } from '../layers'

export function executeAction(
	context: IActionExecutionContext,
	actionId0: string,
	_userData: ActionUserData,
	_triggerMode?: string
): void {
	const actionId = actionId0 as ActionId

	if (actionId === ActionId.LastRemote) {
		executeLastOnSourceLayer(context, SourceLayer.Remote)
	} else if (actionId === ActionId.LastDVE) {
		executeLastOnSourceLayer(context, SourceLayer.DVE)
	}
}

function executeLastOnSourceLayer(context: IActionExecutionContext, sourceLayer: SourceLayer) {
	const lastRemote = context.findLastPieceOnLayer(sourceLayer)
	if (lastRemote) {
		// const partInstance = context.getPartInstance('current')
		const piece = {
			...lastRemote.piece,
			enable: {
				start: 'now' as 'now', // scrap timing
			},
		}

		context.insertPiece('current', piece)
	} else {
		context.notifyUserWarning('No piece was found to replay')
		context.logWarning(`No last piece found on layer ${sourceLayer}`)
	}
}
