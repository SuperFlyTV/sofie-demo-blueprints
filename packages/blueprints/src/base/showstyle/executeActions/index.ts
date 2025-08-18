import {
	ActionUserData,
	BlueprintPlayoutPersistentStore,
	IActionExecutionContext,
	IDataStoreActionExecutionContext,
	NoraContent,
	WithTimeline,
} from '@sofie-automation/blueprints-integration'
import { ActionId } from './actionDefinitions.js'
import { SourceLayer } from '../applyconfig/layers.js'

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
	} else if (actionId === ActionId.GFXNextStep) {
		await executeGraphicNextStep(context)
	}
}

export async function executeDataStoreAction(
	context: IDataStoreActionExecutionContext,
	actionId0: string,
	userData: ActionUserData,
	triggerMode?: string
): Promise<void> {
	const actionId = actionId0 as ActionId
	context.logDebug(
		'executeDataStoreAction id:' + actionId + ' userData: ' + JSON.stringify(userData) + ' Triggermode :' + triggerMode
	)
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
export async function executeGraphicNextStep(context: IActionExecutionContext): Promise<void> {
	const pieceInstances = await context.getPieceInstances('current')

	const steppedPieceInstances = pieceInstances.filter(
		(piece) => (piece.piece.content as unknown as WithTimeline<NoraContent>).step
	)

	for (const piece of steppedPieceInstances) {
		const content = piece.piece.content as unknown as WithTimeline<NoraContent>
		if (content.step) {
			const newStep = content.step.current !== content.step.count ? content.step.current + 1 : content.step.current

			await context.updatePieceInstance(piece._id, {
				...piece.piece,
				content: {
					...content,
					/* If needed modify the timelineObjects too.
					
					timelineObjects: content.timelineObjects.map((tlObj) => ({
						...tlObj,
						content: {
							...tlObj.content,
							data: (tlObj.content as any).data
								? { ...(tlObj.content as any).data, currentStep: content.step ? newStep : undefined }
								: undefined,
						},
					})), */
					// update step data
					step: { ...content.step, current: newStep },
				},
			})
		}
	}
}
