import { BlueprintResultApplyShowStyleConfig, ICommonContext } from '@sofie-automation/blueprints-integration'
import { ShowStyleConfig } from '../../../$schemas/generated/main-showstyle-config.js'
import { getOutputLayer } from './outputlayers.js'
import { getSourceLayer } from './sourcelayers.js'
import { getTriggeredActions } from './triggered-actions.js'

export function applyConfig(
	_context: Readonly<ICommonContext>,
	config: Readonly<ShowStyleConfig>
): BlueprintResultApplyShowStyleConfig {
	console.log('applyConfig', config)
	return {
		sourceLayers: getSourceLayer(),
		outputLayers: getOutputLayer(),
		triggeredActions: getTriggeredActions(),
	}
}
