import {
	StudioConfig,
	VmixControlMode,
	VmixRegistryInputConfig,
} from '../../../$schemas/generated/main-studio-config.js'
import { VisionMixerDevice } from './config.js'

export type VmixInputReference = number | string

export function getVmixControlMode(config: StudioConfig): VmixControlMode {
	return config.vmixControlMode ?? VmixControlMode.Demo
}

export function isVmixProductionMode(config: StudioConfig): boolean {
	return config.visionMixer.type === VisionMixerDevice.VMix && getVmixControlMode(config) === VmixControlMode.Production
}

export function shouldGenerateCasparCGTimeline(config: StudioConfig): boolean {
	return !isVmixProductionMode(config)
}

export function resolveVmixInput(config: StudioConfig, key: string): VmixRegistryInputConfig | undefined {
	return config.vmixInputs?.[key]
}

export function resolveVmixInputByRole(config: StudioConfig, role: string): VmixRegistryInputConfig | undefined {
	const entries = Object.values<VmixRegistryInputConfig>(config.vmixInputs ?? {})
	return entries.find((entry) => entry.role === role)
}

export function getVmixInputLayerId(key: string): string {
	return `vmix_input_${normalizeRegistryKey(key)}`
}

export function getVmixOverlayLayerId(key: string): string {
	return `vmix_overlay_${normalizeRegistryKey(key)}`
}

export function getVmixMixProgramLayerId(mix: number): string {
	return mix === 1 ? 'vmix_me_program' : `vmix_mix${mix}_program`
}

export function getVmixMixPreviewLayerId(mix: number): string {
	return mix === 1 ? 'vmix_me_preview' : `vmix_mix${mix}_preview`
}

export function formatVmixMappingIndex(input: VmixInputReference): string {
	return typeof input === 'number' ? String(input) : input
}

function normalizeRegistryKey(key: string): string {
	return key.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase()
}

export function validateVmixInputsRegistry(config: StudioConfig): string[] {
	const errors: string[] = []

	for (const [key, entry] of Object.entries<VmixRegistryInputConfig>(config.vmixInputs ?? {})) {
		if (entry.input === undefined || entry.input === '') {
			errors.push(`vmixInputs.${key}: input is required`)
		}
		if (entry.overlay !== undefined && (entry.overlay < 1 || entry.overlay > 4)) {
			errors.push(`vmixInputs.${key}: overlay must be between 1 and 4`)
		}
		if (entry.mix !== undefined && (entry.mix < 1 || entry.mix > 16)) {
			errors.push(`vmixInputs.${key}: mix must be between 1 and 16`)
		}
	}

	return errors
}
