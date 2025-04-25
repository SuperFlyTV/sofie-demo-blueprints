import { literal } from '../../common/util'
import { BlueprintConfigCoreConfig, ICommonContext } from '@sofie-automation/blueprints-integration'
import { BlueprintConfig, StudioConfig } from './helpers/config'

export function preprocessConfig(
	_context: ICommonContext,
	config: Partial<StudioConfig>,
	coreConfig: BlueprintConfigCoreConfig
): BlueprintConfig {
	console.log('Core config', coreConfig)
	const processedConfig: BlueprintConfig = {
		studio: literal<Partial<StudioConfig>>({
			...config,
		}) as StudioConfig,
	}

	return processedConfig
}
