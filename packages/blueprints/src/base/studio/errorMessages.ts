import type { DeviceErrorMessageFunction } from '@sofie-automation/blueprints-integration'
import { AtemErrorCode, CasparCGErrorCode } from 'timeline-state-resolver-types'

/**
 * Device error messages for the studio blueprint.
 *
 * These override the default messages from TSR devices when errors are reported.
 * The messages are resolved at runtime when device status is received by the server.
 *
 * Keys are error code strings from TSR devices (e.g., AtemErrorCode.DISCONNECTED).
 * Values can be:
 * - String templates with {{placeholder}} syntax for dynamic values
 * - Functions that receive context and return a string (for complex logic)
 * - `undefined` (or function returning `undefined`) to fall back to the default TSR message
 * - Empty string `''` to suppress the message entirely
 *
 * Import error codes from 'timeline-state-resolver-types' for type safety.
 *
 * @example String template
 * [AtemErrorCode.DISCONNECTED]: '{{deviceName}}: Vision mixer offline'
 *
 * @example Function for complex logic
 * [CasparCGErrorCode.CHANNEL_ERROR]: (context) => {
 *   if (context.channel === 1) return 'Primary graphics output failed!'
 *   return `Graphics channel ${context.channel} error`
 * }
 *
 * @example Fall back to default TSR message
 * [SomeErrorCode.COMPLEX_ERROR]: (context) => {
 *   if (context.isKnownIssue) return undefined // Use default message
 *   return 'Custom message for unknown issues'
 * }
 *
 * @example Suppress a message
 * [SomeErrorCode.NOISY_ERROR]: '' // Empty string suppresses the message
 */
export const deviceErrorMessages: Record<string, string | DeviceErrorMessageFunction | undefined> = {
	// ATEM examples - string templates with placeholders
	[AtemErrorCode.DISCONNECTED]: '🎬 Vision mixer {{deviceName}} ran away! 🏃‍♂️💨 (Check the ATEM connection)',
	[AtemErrorCode.PSU_FAULT]: '⚡ {{deviceName}}: Power supply {{psuNumber}} is faulty - check hardware',

	// CasparCG examples - both string templates and functions
	// [CasparCGErrorCode.DISCONNECTED]:
	// 	'👻 {{deviceName}} graphics server is offline - check connection to {{host}}:{{port}}',
	[CasparCGErrorCode.QUEUE_OVERFLOW]: '{{deviceName}} needs restart - CasparCG command queue is full',

	// Example: Function for complex conditional logic
	// Uncomment to test function-based messages:
	// [CasparCGErrorCode.CHANNEL_ERROR]: (context) => {
	// 	const channel = context.channel as number | undefined
	// 	if (channel === 1) {
	// 		return `🚨 PRIMARY graphics output on ${context.deviceName} has failed - CHECK IMMEDIATELY`
	// 	}
	// 	if (channel === undefined) {
	// 		return undefined // Fall back to default TSR message when channel is unknown
	// 	}
	// 	return `Graphics channel ${channel} error on ${context.deviceName}`
	// },
}
