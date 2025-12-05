import { PackageStatusMessage } from '@sofie-automation/blueprints-integration'
// Device error codes come from TSR - import the specific device codes you need
// import { AtemErrorCode, CasparCGErrorCode } from 'timeline-state-resolver'

/**
 * Alternate package status messages, to override the builtin ones produced by Sofie.
 * Use {{placeholder}} syntax for dynamic values that will be substituted at runtime.
 */
export const packageStatusMessages: Partial<Record<PackageStatusMessage, string | undefined>> = {
	[PackageStatusMessage.MISSING_FILE_PATH]: `Some file paths are missing or incorrect. Please check your show style configuration.`,
}
