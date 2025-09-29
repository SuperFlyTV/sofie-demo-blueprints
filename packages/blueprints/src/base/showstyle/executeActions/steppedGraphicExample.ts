import {
	IActionExecutionContext,
	WithTimeline,
	NoraContent,
	IAdLibFilterLink,
	IBlueprintTriggeredActions,
	IGUIContextFilterLink,
	IRundownPlaylistFilterLink,
	PlayoutActions,
	TriggerType,
	IBlueprintActionManifest,
	JSONBlobStringify,
	ExtendedIngestRundown,
} from '@sofie-automation/blueprints-integration'
import { literal, t } from '../../../common/util.js'
import { SourceLayer, getOutputLayerForSourceLayer } from '../applyconfig/layers.js'
import { ActionId } from './actionDefinitions.js'
import { getResolvedCurrentlyPlayingPieceInstances } from '../helpers/pieces.js'

/**
 * Defines an AdLib Action that steps through a Stepped Graphic.
 *
 * Provides example for defining the actionOptions schema and triggerModes
 *
 * @param ingestRundown - {ExtendedIngestRundown}
 * @returns IBlueprintActionManifest
 */
export const exampleGraphicNextStepAdlibAction = (ingestRundown: ExtendedIngestRundown): IBlueprintActionManifest =>
	literal<IBlueprintActionManifest>({
		actionId: ActionId.GFXStep,
		userData: {},
		/** Describes the expected format of `userData` and `actionOptions` passed to the action when executed.
		 * userData is currently never passed to the action, reserved for future functionality to allow users to change AdLib settings in the Sofie UI
		 */
		userDataManifest: {
			optionsSchema: JSONBlobStringify({
				$schema: 'http://json-schema.org/draft-04/schema#',
				type: 'object',
				properties: {
					jumpTo: {
						type: 'number',
					},
					increment: {
						type: 'number',
					},
				},
			}),
		},
		display: {
			label: t('Control Graphic Step'),
			sourceLayerId: SourceLayer.GFX,
			outputLayerId: getOutputLayerForSourceLayer(SourceLayer.GFX),
		},
		triggerModes: [
			{
				data: ExampleGFXStepActionTriggerModes.NEXT,
				display: {
					_rank: 0,
					label: t('Next Slide'),
					description: t('this is a description'),
				},
			},
			{
				data: ExampleGFXStepActionTriggerModes.PREV,
				display: {
					_rank: 0,
					label: t('Previous Slide'),
					description: t('this is a description'),
				},
			},
		],
		externalId: ingestRundown.externalId,
	})

export enum ExampleGFXStepActionTriggerModes {
	NEXT = 'next',
	PREV = 'prev',
}

export interface ExampleGFXStepActionOptions {
	increment: number
	jumpTo: number | undefined
}

/**
 * A global action that can be executed any-time in the show.
 * We check if our current part has any stepped graphic pieces and step through them until we reach the last step.
 *
 * Also supports trigger modes to step backwards and actionOptions to jump to a specific step or change the increment.
 *
 * Be sure to add it to `executeAction` in 'packages/blueprints/src/base/showstyle/executeActions/index.ts' if you are making your own.
 *
 * @param context - {IActionExecutionContext}
 * @param triggerMode - {string} - A simple string value that describes how the AdLib shoul
 * @param actionOptions - {ExampleActionOptions}
 */
export async function executeGraphicNextStep(
	context: IActionExecutionContext,
	triggerMode?: string,
	actionOptions: ExampleGFXStepActionOptions = {
		increment: 1,
		jumpTo: undefined,
	}
): Promise<void> {
	// we filter for any stepped graphic piece
	const pieceInstances = await getResolvedCurrentlyPlayingPieceInstances(context)
	const steppedPieceInstances = pieceInstances.filter(
		(piece) => (piece.piece.content as unknown as WithTimeline<NoraContent>).step
	)

	// we execute the action for each of them
	for (const piece of steppedPieceInstances) {
		const content = piece.piece.content as unknown as WithTimeline<NoraContent>
		if (content.step) {
			const { count, current } = content.step

			// determine increment
			let increment = actionOptions?.increment ?? 1 // fall back to 1
			if (triggerMode === ExampleGFXStepActionTriggerModes.PREV) increment = -increment

			// calculate new step
			let newStep: number
			if (actionOptions?.jumpTo !== undefined) {
				// jump to specific step if specified
				newStep = actionOptions.jumpTo
			} else {
				newStep = current + increment
			}
			// and keep it between the bounds of available steps
			newStep = Math.max(1, Math.min(newStep, count))

			await context.updatePieceInstance(piece._id, {
				...piece.piece,
				content: {
					...content,

					// update step data
					step: { ...content.step, current: newStep },

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
				},
			})
		}
	}
}

/**
 * This function creates a hotkey to execute the AdLib definied above. Implementing this is optional, users can also configure it using the UI.
 * It has to be supplied to Sofie through `getTriggeredActions` in 'packages/blueprints/src/base/showstyle/applyconfig/triggered-actions.ts'
 *
 * The example shows how you can create keyboard and Stream Deck hotkeys.
 *
 * @param rankCounter - {number}
 * @returns IBlueprintTriggeredActions
 */
export function createAdLibHotkeyWithTriggerMode(rankCounter: number): IBlueprintTriggeredActions {
	return {
		_id: 'custom_adLib_hotkey_example',
		_rank: rankCounter++ * 1000,
		actions: {
			[PlayoutActions.adlib]: {
				action: PlayoutActions.adlib,
				arguments: {
					// triggerMode that gets passed to the adLib. For each desired triggerMode you need to define a new hotkey.
					triggerMode: ExampleGFXStepActionTriggerModes.PREV,
				},
				filterChain: [
					{
						object: 'view',
					},
					{
						object: 'adLib',
						field: 'label',
						// Filter for adLibs with the label 'Control Graphic Step'
						value: ['Control Graphic Step'],
					},
				].filter(Boolean) as (IRundownPlaylistFilterLink | IGUIContextFilterLink | IAdLibFilterLink)[],
			},
		},
		// an action can have multiple triggers
		triggers: {
			['Hotkey trigger']: {
				type: TriggerType.hotkey,
				keys: 'L', // executed on press of the 'L' key when the sofie UI is open
				up: false,
			},
			['Device trigger']: {
				type: TriggerType.device,
				deviceId: 'device0',
				triggerId: '7 ↧', // on press of streamdeck button #7 connected via input gateway
			},
		},
		// User presentable name of the trigger
		name: 'Custom Adlib from Blueprint',
	}
}
