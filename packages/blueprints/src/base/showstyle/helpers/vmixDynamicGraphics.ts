/**
 * Abstraction layer for future vMix dynamic graphics support.
 *
 * TSR currently exposes VMixCommand.SET_TEXT, BROWSER_NAVIGATE, and related INPUT
 * content fields, but timeline-state-resolver does not yet provide stable,
 * first-class timeline objects for live text/timer/browser updates during playout.
 *
 * Do not call unimplemented methods from production code paths until TSR support exists.
 */

export interface VMixDynamicTextUpdate {
	input: number | string
	field: string
	value: string
}

export interface VMixDynamicTimerUpdate {
	input: number | string
	field: string
	value: string
	running?: boolean
}

export interface VMixDynamicBrowserUpdate {
	input: number | string
	url: string
	reload?: boolean
}

export interface VMixDynamicGraphicsAdapter {
	/**
	 * Planned: emit SET_TEXT commands for XAML/title inputs.
	 * TSR limitation: no dedicated timeline content type for SET_TEXT updates today.
	 */
	setText(_update: VMixDynamicTextUpdate): void

	/**
	 * Planned: update countdown/timer fields on vMix title inputs.
	 * TSR limitation: timer field updates are not exposed as timeline keyframes.
	 */
	updateTimer(_update: VMixDynamicTimerUpdate): void

	/**
	 * Planned: navigate browser inputs and optionally reload.
	 * TSR limitation: BROWSER_NAVIGATE exists as a command but not as routable timeline content.
	 */
	updateBrowserUrl(_update: VMixDynamicBrowserUpdate): void
}

export class UnimplementedVMixDynamicGraphicsAdapter implements VMixDynamicGraphicsAdapter {
	setText(_update: VMixDynamicTextUpdate): void {
		throw new Error('VMix SET_TEXT dynamic updates are not implemented in TSR yet')
	}

	updateTimer(_update: VMixDynamicTimerUpdate): void {
		throw new Error('VMix timer dynamic updates are not implemented in TSR yet')
	}

	updateBrowserUrl(_update: VMixDynamicBrowserUpdate): void {
		throw new Error('VMix browser URL dynamic updates are not implemented in TSR yet')
	}
}

/**
 * Known TSR gaps for dynamic vMix graphics (audit baseline for future work):
 * - SET_TEXT: command exists; no timeline object for live updates during a part
 * - Timer fields: no timeline content for countdown updates
 * - Browser URL: BROWSER_NAVIGATE command exists; not available as timeline keyframe content
 */
export const VMIX_DYNAMIC_GRAPHICS_TSR_LIMITATIONS = [
	'SET_TEXT has no dedicated TimelineContentVMix type for live field updates',
	'Timer/countdown field updates are not supported as timeline keyframes',
	'BROWSER_NAVIGATE is a device action/command, not timeline overlay content',
] as const

export function createVMixDynamicGraphicsAdapter(): VMixDynamicGraphicsAdapter {
	return new UnimplementedVMixDynamicGraphicsAdapter()
}
