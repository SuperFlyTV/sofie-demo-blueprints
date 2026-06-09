import { ICommonContext, IConfigMessage, NoteSeverity } from '@sofie-automation/blueprints-integration'
import { StudioConfig, VisionMixerDevice, VmixControlMode } from './helpers/config.js'
import { validateVmixInputsRegistry } from './helpers/vmixInputs.js'
import { t } from '../../common/util.js'

export function validateConfig(_context: ICommonContext, config: StudioConfig): Array<IConfigMessage> {
	const messages: IConfigMessage[] = []

	for (const error of validateVmixInputsRegistry(config)) {
		messages.push({
			level: NoteSeverity.ERROR,
			message: t(error),
		})
	}

	if (config.visionMixer.type === VisionMixerDevice.VMix && config.vmixControlMode === VmixControlMode.Production) {
		if (!config.vmixInputs || Object.keys(config.vmixInputs).length === 0) {
			messages.push({
				level: NoteSeverity.WARNING,
				message: t('Production vMix mode is enabled but vmixInputs registry is empty'),
			})
		}
	}

	if (config.atemSources) {
		messages.push({
			level: NoteSeverity.INFO,
			message: t('Here in validateConfig you can add check for e.g. Atem/VMix'),
		})
	}
	return messages
}
