import { BlueprintResultApplyShowStyleConfig, ICommonContext } from '@sofie-automation/blueprints-integration'
import { ShowStyleConfig } from '../../../generated/showStyle-config'
import { getOutputLayer } from './outputlayers'
import { getSourceLayer } from './sourcelayers'
import { getTriggeredActions } from './triggered-actions'

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
