import {
	PackageStatusMessage,
	DeviceErrorCode,
	BlueprintErrorCode,
	SystemErrorCode,
} from '@sofie-automation/blueprints-integration'

/**
 * Alternate package status messages, to override the builtin ones produced by Sofie.
 * Use {{placeholder}} syntax for dynamic values that will be substituted at runtime.
 */
export const packageStatusMessages: Partial<Record<PackageStatusMessage, string | undefined>> = {
	[PackageStatusMessage.MISSING_FILE_PATH]: `Some file paths are missing or incorrect. Please check your show style configuration.`,
}

/**
 * Alternate device error messages, to override the builtin ones produced by Sofie.
 * Use {{placeholder}} syntax for dynamic values that will be substituted at runtime.
 */
export const deviceErrorMessages: Partial<Record<DeviceErrorCode, string | undefined>> = {
	[DeviceErrorCode.HTTP_TIMEOUT]: '{{deviceName}}: Graphics system not responding',
	[DeviceErrorCode.CASPARCG_DISCONNECTED]: '{{deviceName}}: Video server offline - videos will not play',
}

/**
 * Dynamic error message resolver for complex logic like pluralization or conditional messages.
 * Called before checking static error message records above.
 *
 * @param errorCode - The error code (device, blueprint, or system)
 * @param args - Context arguments available for the message (e.g., deviceName, count, fileName)
 * @returns A custom message string, empty string to suppress, or undefined to fall through to static messages
 *
 * @example
 * // Pluralization
 * if (errorCode === DeviceErrorCode.CASPARCG_FILES_NOT_FOUND) {
 *   const count = args.count || 1
 *   return count === 1 ? 'File not found' : `${count} files not found`
 * }
 *
 * @example
 * // Conditional based on context
 * if (errorCode === BlueprintErrorCode.VALIDATION_ERROR && args.field === 'duration') {
 *   return 'Duration must be between 0 and 24 hours'
 * }
 *
 * @example
 * // Suppress a message entirely
 * if (errorCode === DeviceErrorCode.SOME_NOISY_ERROR) {
 *   return '' // Empty string suppresses the message
 * }
 */
export function resolveErrorMessage(
	errorCode: DeviceErrorCode | BlueprintErrorCode | SystemErrorCode,
	args: Record<string, unknown>
): string | undefined {
	// Example: Pluralize missing files message
	if (errorCode === DeviceErrorCode.CASPARCG_FILES_NOT_FOUND) {
		const count = (args.count as number) || 1
		return count === 1 ? `{{deviceName}}: Video file not found` : `{{deviceName}}: ${count} video files not found`
	}

	// Example: Custom message based on context
	if (errorCode === BlueprintErrorCode.VALIDATION_ERROR) {
		const field = args.field as string | undefined
		if (field === 'duration') {
			return 'Invalid duration - must be between 0 and 24 hours'
		}
	}

	// Return undefined to use static messages or defaults
	return undefined
}
