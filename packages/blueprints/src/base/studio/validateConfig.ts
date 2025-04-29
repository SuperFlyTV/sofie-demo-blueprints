import { ICommonContext, IConfigMessage, NoteSeverity } from '@sofie-automation/blueprints-integration'
import { StudioConfig } from './helpers/config.js'
import { t } from '../../common/util.js'

export function validateConfig(_context: ICommonContext, config: StudioConfig): Array<IConfigMessage> {
	const messages: IConfigMessage[] = []

	if (config.atemSources) {
		messages.push({ level: NoteSeverity.ERROR, message: t('Here we should add check for Atem/VMix') })
	}
	return messages
}
