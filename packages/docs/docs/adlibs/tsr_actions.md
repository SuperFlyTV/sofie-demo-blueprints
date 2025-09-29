# TSR Actions

## Introduction to TSR Actions

A TSR Action is a method which is executed inside of a TSR integration. The method can be called upon from Sofie, and subsequently Blueprints Adlib Actions.

### Why do they exist?

The main way to control devices (through TSR integrations) in Sofie is via the Timeline. By defining a time-based "State" in blueprints, the TSR can diff the target State compared to the current State at the time of playout, and generate commands to send. This is powerful since it allows Sofie (and blueprints) to not have to take into account the "current state" of the controlled device, and instead focus on the desired state at the time of playout.
It also decouples the TSR device from Sofie/Blueprints on a "time-sensitiveness" level, since it allows Sofie to _not_ have to be as time-sensitive as the TSR device and increases the likelihood of commands being sent at the correct time.

For certain operations though, the time sensitivity is not important, and there is no state to be diffed. Some example operations can be "Restart a device", "Clear all channels", "Send a custom HTTP request" or "Retrieve some data". It is for these operations that TSR Actions exist. TSR Actions are often being used in these ways during onRundownActivate and onRundownDeActivate, to reset and prepare the system for a show or to perform some cleanup.

### A few words of caution

It can be tempting to design a TSR device to ONLY expose TSR Actions, and not use the Timeline at all. This is (often) not recommended, as if goes agains one of the core design philosophies of Sofie - the "state-based approach". In general, if an "action" can be considered to modify a trackable state of a device (for example: the "play" and "stop" actions modifies the playing status of a video player), it should be defined as a state in TSR and controlled via the Timeline, and not be a TSR Action.

## How do define a TSR action

https://github.com/Sofie-Automation/sofie-timeline-state-resolver/tree/main/packages/timeline-state-resolver/src/integrations/abstract

1. Define the method to be executed at the TSR integration.
   ref: https://github.com/Sofie-Automation/sofie-timeline-state-resolver/blob/release52/packages/timeline-state-resolver/src/integrations/abstract/index.ts#L31
2. Define the action in the TSR integration schema
   ref: https://github.com/Sofie-Automation/sofie-timeline-state-resolver/blob/release52/packages/timeline-state-resolver/src/integrations/abstract/%24schemas/actions.json#L5
3. Run `yarn generate-schema-types` to generate the TypeScript types for the action schema in timeline-state-resolver-types folder

## How to execute a TSR action from an Adlib Action

Here is an example for how to execute a TSR Action from within a Blueprint Adlib Action:

```typescript
import { TSR, IRundownActivationContext } from '@sofie-automation/blueprints-integration'

export async function onMyAdlibAction(context: IActionExecutionContext): Promise<void> {
	// Get a list of the available TSR devices:
	const devices = await context.listPlayoutDevices()

	// Pick a certain device (or just hardcode the deviceId if you know it):
	const myDevice = devices.find((device) => device.deviceType === TSR.DeviceType.CASPARCG)

	if (myDevice) {
		// execute the TSR Action
		const result = await context.executeTSRAction(myDevice.deviceId, TSR.CasparCGActions.ClearAllChannels, {
			// payload
		})

		if (result.result === TSR.ActionExecutionResultCode.Ok) {
			result.resultData // This is the result data, if any
		} else if (result.result === TSR.ActionExecutionResultCode.Error) {
			// handle error
			result.response
			result.resultData // This is the result data, if any
		} else if (result.result === TSR.ActionExecutionResultCode.IgnoredNotRelevant) {
			// IgnoredNotRelevant can be returned from the TSR Action if the action was not relevant and therefore ignored
		}
	}
}
```
