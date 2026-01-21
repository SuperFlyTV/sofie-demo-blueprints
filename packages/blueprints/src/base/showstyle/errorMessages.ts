import { PackageStatusMessage, BlueprintErrorCode, BlueprintErrorEvent } from '@sofie-automation/blueprints-integration'
import { AtemErrorCode, CasparCGErrorCode } from 'timeline-state-resolver-types'

/**
 * Alternate package status messages, to override the builtin ones produced by Sofie.
 * Use {{placeholder}} syntax for dynamic values that will be substituted at runtime.
 */
export const packageStatusMessages: Partial<Record<PackageStatusMessage, string | undefined>> = {
	[PackageStatusMessage.MISSING_FILE_PATH]: `Some file paths are missing or incorrect. Please check your show style configuration.`,
}

/**
 * Alternate device error messages, to override the default messages from TSR devices.
 * Keys are error code strings from TSR devices (e.g., 'DEVICE_ATEM_DISCONNECTED').
 *
 * Import error codes from 'timeline-state-resolver-types' for type safety.
 * Use {{placeholder}} syntax for dynamic values that will be substituted at runtime.
 *
 * @example
 * import { AtemErrorCode, CasparCGErrorCode } from 'timeline-state-resolver-types'
 *
 * export const deviceErrorMessages: Record<string, string | undefined> = {
 *   [AtemErrorCode.DISCONNECTED]: '{{deviceName}}: Vision mixer offline',
 *   [AtemErrorCode.PSU_FAULT]: '{{deviceName}}: PSU {{psuNumber}} fault',
 *   [CasparCGErrorCode.DISCONNECTED]: '{{deviceName}}: Graphics server offline ({{host}}:{{port}})',
 * }
 */
export const deviceErrorMessages: Record<string, string | undefined> = {
	// TEST: Silly message to verify error customisation is working
	[AtemErrorCode.DISCONNECTED]: '🎬 Oh no! The vision mixer ran away! 🏃‍♂️💨 (Check the ATEM connection)',

	// CasparCG error examples
	[CasparCGErrorCode.DISCONNECTED]:
		'👻 Caspar is a ghost - {{deviceName}} graphics server is offline - check {{host}}:{{port}}',
	[CasparCGErrorCode.QUEUE_OVERFLOW]: '{{deviceName}} needs restart - CasparCG command queue is full',
}

/**
 * Dynamic error message resolver for complex logic like pluralization or conditional messages.
 * Called before checking static error message records above.
 *
 * @param event - Object containing errorCode (string) and args (Record<string, unknown>)
 * @returns A custom message string, empty string to suppress, or undefined to fall through to static messages
 *
 * @example
 * // Pluralization (using string error code from TSR)
 * if (event.errorCode === 'DEVICE_CASPARCG_FILES_NOT_FOUND') {
 *   const count = event.args.count || 1
 *   return count === 1 ? 'File not found' : `${count} files not found`
 * }
 *
 * @example
 * // Conditional based on context
 * if (event.errorCode === BlueprintErrorCode.VALIDATION_ERROR && event.args.field === 'duration') {
 *   return 'Duration must be between 0 and 24 hours'
 * }
 *
 * @example
 * // Suppress a message entirely
 * if (event.errorCode === 'DEVICE_SOME_NOISY_ERROR') {
 *   return '' // Empty string suppresses the message
 * }
 */
export function resolveErrorMessage(event: BlueprintErrorEvent): string | undefined {
	// Example: Custom message based on context
	// eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
	if (event.errorCode === BlueprintErrorCode.VALIDATION_ERROR) {
		if (event.args.field === 'duration') {
			return 'Invalid duration - must be between 0 and 24 hours'
		}
	}

	// Return undefined to use static messages or defaults
	return undefined
}
