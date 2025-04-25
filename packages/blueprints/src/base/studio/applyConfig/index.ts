import {
	BlueprintConfigCoreConfig,
	BlueprintResultApplyStudioConfig,
	ICommonContext,
	TSR,
} from '@sofie-automation/blueprints-integration'
import { StudioConfig } from '../helpers/config'
import { getMappingsDefaults } from './mappings'
import { preprocessConfig } from '../preprocessConfig'

export function applyConfig(
	context: ICommonContext,
	config: StudioConfig,
	coreConfig: BlueprintConfigCoreConfig
): BlueprintResultApplyStudioConfig {
	const parsedConfig = preprocessConfig(context, config, coreConfig)

	return {
		mappings: getMappingsDefaults(parsedConfig),
		playoutDevices: generatePlayoutDevices(),
		inputDevices: {},
		ingestDevices: {},
		parentDevices: {},
	}
}

function generatePlayoutDevices(): Record<string, TSR.DeviceOptionsAny> {
	return {
		core_packageInfo: {
			// For package-manager storybuilder payloads
			type: TSR.DeviceType.ABSTRACT,
			disable: true,
		},
		core_thumbnails: {
			// For package-manager html previews
			type: TSR.DeviceType.ABSTRACT,
			disable: true,
		},
	}
}
