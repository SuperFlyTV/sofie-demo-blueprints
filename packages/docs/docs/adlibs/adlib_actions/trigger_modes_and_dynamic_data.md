import triggerModeShelf from '@site/static/img/adlibs/triggerModeShelf.png'
import triggerSettings from '@site/static/img/adlibs/triggerSettings.png'
import triggerModeExample1 from '@site/static/img/adlibs/triggerModeExample1.gif'
import triggerModeExample2 from '@site/static/img/adlibs/triggerModeExample2.gif'

# Trigger modes and dynamic data in AdLib Actions

## What is a trigger mode?

Trigger modes are alternate ways of executing an AdLib Action. They show up as options when right-clicking an AdLib Action in the shelf. They are also exposed over the LSG as the `actionType` and can be used through the REST API as the `actionType` property.

## Trigger modes in blueprints

When defining a `IBlueprintActionManifest` you can add an optional `triggerModes` property which is an array of `IBlueprintActionTriggerMode` objects.

Example Action Manifest with two trigger modes:

```typescript
{
	actionId: ActionId.GFXStep,
	userData: {},
	userDataManifest: {},
	display: {
		label: t('Control Graphic Step'),
		sourceLayerId: SourceLayer.GFX,
		outputLayerId: getOutputLayerForSourceLayer(SourceLayer.GFX),
	},
	triggerModes: [
		{
			data: 'next',
			display: {
				_rank: 0,
				label: t('Next Slide'),
				description: t('Advance the graphic to the next step'),
			},
		},
		{
			data: 'prev',
			display: {
				_rank: 1,
				label: t('Previous Slide'),
				description: t('Change the graphic to the previous step'),
			},
		},
	],
	externalId: ingestRundown.externalId,
}
```

`packages/blueprints/src/base/showstyle/executeActions/steppedGraphicExample.ts`

## Trigger modes in Sofie UI (shelf)

The trigger modes will already show up in Sofie UI after reloading the rundown data.

<img src={triggerModeShelf} />

## Trigger modes in Trigger system (key binding and/or streamdeck over input gateway)

Triggers in the Trigger system can be created by the blueprints during migrations or can be created using in Sofie UI's Settings menu.
https://sofie-automation.github.io/sofie-core/docs/user-guide/configuration/settings-view#action-triggers-1

Example hotkey/streamdeck trigger in the Sofie UI:

<img src={triggerSettings} />

The same trigger as you would declare it in the blueprints:

```typescript
export function createAdLibHotkeyExample(): IBlueprintTriggeredActions {
	return {
		_id: 'custom_adLib_hotkey_example',
		_rank: rankCounter++ * 1000,
		actions: {
			[PlayoutActions.adlib]: {
				action: PlayoutActions.adlib,
				arguments: { triggerMode: 'prev' },
				filterChain: [
					{
						object: 'view',
					},
					{
						object: 'adLib',
						field: 'label',
						value: ['Control Graphic Step'],
					},
				].filter(Boolean) as (IRundownPlaylistFilterLink | IGUIContextFilterLink | IAdLibFilterLink)[],
			},
		},
		triggers: {
			['Hotkey trigger']: {
				type: TriggerType.hotkey,
				keys: 'L',
				up: false,
			},
			['Device trigger']: {
				type: TriggerType.device,
				deviceId: 'device0',
				triggerId: '7 ↧', // on release of streamdeck button #7 connected via input gateway
			},
		},
		name: 'Custom Adlib from Blueprint',
	}
}
```

`packages/blueprints/src/base/showstyle/executeActions/steppedGraphicExample.ts`

By adding the above object to the array returned by `getTriggeredActions` in `packages\blueprints\src\base\showstyle\applyconfig\triggered-actions.ts` (Demo Blueprints) and applying the new showstyle config in Sofie UI after importing the new Blueprint: <kbd><kbd>Settings</kbd> ⇒ <kbd>Select your Showstyle</kbd> ⇒ <kbd>Blueprint Configuration</kbd> ⇒ <kbd>Fix Up Config</kbd> ⇒ <kbd>Validate and Apply Config</kbd></kbd>, the new global shortcut will become available.

## Trigger modes over API

To use Trigger Modes form the REST API you need to specify the `actionType` property on the body of the request.

The correct `adLibId` can be obtained using the Live Status Gateway under the `adLibs` topic

Example request:

```javascript
const options = {
	method: 'POST',
	headers: {
		'Access-Control-Request-Headers': 'content-type',
		'Access-Control-Request-Method': 'POST',
		'Content-Type': 'application/json',
	},
	body: JSON.stringify({
		adLibId: 'mLwUbMWgpVw0QlgKWiNJ09da6PM_', // the ID of your AdLib
		actionType: 'prev', // triggerMode (e.g. "prev" or "next")
	}),
}

fetch('http://localhost:3000/api/v1.0/playlists/4HU7AFfcs7C4Noma30oxGFg3ZxE_/execute-adlib', options)
	.then((response) => response.json())
	.then((response) => console.log(response))
	.catch((err) => console.error(err))
```

## Custom payloads over the API

You can send custom payloads over the API as well, providing more control over the executed action.

We recommend declaring a `userDataManifest` for the AdLib Action since this manifest/schema is published using the Live Status Gateway for external applications to programmatically create UIs and API calls. We also recommend to validate the objects received in your action as Sofie Core doesn't validate the payload.

There is a planned feature in Sofie UI to generate fields for the user to edit the AdLib before executing it. Sofie UI currently doesn't support this feature, but it will depend on the `userDataManifest`.

```typescript
{
	actionId: ActionId.GFXStep,
	userData: {},
	userDataManifest: {
		optionsSchema: JSONBlobStringify({
			$schema: 'http://json-schema.org/draft-04/schema#',
			type: 'object',
			properties: {
				test: {
					type: 'string',
				},
			},
			required: ['test'],
		}),
	},
	display: {
		label: t('Control Graphic Step'),
		sourceLayerId: SourceLayer.GFX,
		outputLayerId: getOutputLayerForSourceLayer(SourceLayer.GFX),
	}
	externalId: ingestRundown.externalId,
}
```

`packages/blueprints/src/base/showstyle/executeActions/steppedGraphicExample.ts`

To send custom data with a request you do so using the `adlibOptions` property which should follow the schema described in `userDataManifest`.

```javascript
const options = {
	method: 'POST',
	headers: {
		'Access-Control-Request-Headers': 'content-type',
		'Access-Control-Request-Method': 'POST',
		'Content-Type': 'application/json',
	},
	body: JSON.stringify({
		adLibId: 'mLwUbMWgpVw0QlgKWiNJ09da6PM_', // the ID of your AdLib
		adlibOptions: {
			// This is an example an object following the schema we declared above
			test: 'Custom string payload here',
		},
	}),
}

fetch('http://localhost:3000/api/v1.0/playlists/4HU7AFfcs7C4Noma30oxGFg3ZxE_/execute-adlib', options)
	.then((response) => response.json())
	.then((response) => console.log(response))
	.catch((err) => console.error(err))
```

## How to consume these in the blueprints

This example implements an AdLibAction that increments and decrements steps of a stepped Graphic piece with the option to jump to a specific step.

```typescript
export async function executeAction(
	context: IActionExecutionContext,
	_playoutPersistentState: BlueprintPlayoutPersistentStore<unknown>,
	actionId0: string,
	_userData: ActionUserData,
	triggerMode?: string,
	_privateData?: unknown,
	_publicData?: unknown,
	actionOptions?: { [key: string]: any }
): Promise<void> {
	const actionId = actionId0 as ActionId

	if (actionId === ActionId.GFXNextStep) {
		await executeGraphicNextStep(context, triggerMode, actionOptions as ExampleGFXStepActionOptions)
	}
}
```

`packages/blueprints/src/base/showstyle/executeActions/index.ts`

```typescript
type ExampleGFXStepActionOptions = {
	increment: number
	jumpTo: number | undefined
}

export async function executeGraphicNextStep(
	context: IActionExecutionContext,
	triggerMode?: string,
	actionOptions: ExampleGFXStepActionOptions = { increment: 1 }
): Promise<void>
	// we filter for any stepped graphic piece
	const pieceInstances = await context.getPieceInstances('current')
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
				},
			})
		}
	}
}
```

## Result

<img src={triggerModeExample1} />
<img src={triggerModeExample2} />
