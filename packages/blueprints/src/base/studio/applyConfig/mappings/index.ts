import { BlueprintMappings } from '@sofie-automation/blueprints-integration'
import { BlueprintConfig } from '../../helpers/config.js'
import mappingsDefaults from './mappings-defaults.js'

export function getMappingsDefaults(config: BlueprintConfig): BlueprintMappings {
	console.log('getMappingsDefaults', config)
	//ToDo: Split this up into files with specific mappings for each device:
	const mappings: BlueprintMappings = mappingsDefaults
	return mappings
}
