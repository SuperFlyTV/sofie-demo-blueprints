import { PackageStatusMessage } from '@sofie-automation/blueprints-integration'
// Device error codes come from TSR - import the specific device codes you need
import { AtemErrorCode } from 'timeline-state-resolver'

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
 * Import error codes from 'timeline-state-resolver' (e.g., AtemErrorCode).
 *
 * Use {{placeholder}} syntax for dynamic values that will be substituted at runtime.
 *
 * @example
 * import { AtemErrorCode } from 'timeline-state-resolver'
 *
 * export const deviceErrorMessages: Record<string, string | undefined> = {
 *   [AtemErrorCode.DISCONNECTED]: '{{deviceName}}: Vision mixer offline',
 *   [AtemErrorCode.PSU_FAULT]: '{{deviceName}}: PSU {{psuNumber}} fault',
 * }
 */
export const deviceErrorMessages: Record<string, string | undefined> = {
	// TEST: Silly message to verify error customisation is working
	[AtemErrorCode.DISCONNECTED]: '🎬 Oh no! The vision mixer ran away! 🏃‍♂️💨 (Check the ATEM connection)',
}
