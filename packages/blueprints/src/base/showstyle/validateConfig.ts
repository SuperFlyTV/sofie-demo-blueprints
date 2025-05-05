import { ICommonContext, IConfigMessage, NoteSeverity } from '@sofie-automation/blueprints-integration'
import { ShowStyleConfig } from './helpers/config.js'
import { t } from '../../common/util.js'

export function validateConfig(_context: ICommonContext, _config: ShowStyleConfig): Array<IConfigMessage> {
	const messages: IConfigMessage[] = []

	// Example validation
	if (_config.dvePresets) {
		messages.push({
			level: NoteSeverity.INFO,
			message: t('Here you can add validation for your showstyle config'),
		})
	}

	return messages
}
