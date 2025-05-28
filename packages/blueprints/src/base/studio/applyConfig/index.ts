import {
	BlueprintConfigCoreConfig,
	BlueprintMosDeviceConfig,
	BlueprintParentDeviceSettings,
	BlueprintResultApplyStudioConfig,
	ICommonContext,
	TSR,
} from '@sofie-automation/blueprints-integration'
import { BlueprintConfig, StudioConfig, VisionMixerDevice } from '../helpers/config.js'
import { getMappingsDefaults } from './mappings/index.js'
import { preprocessConfig } from '../preprocessConfig.js'
import { literal } from '../../../common/util.js'

export function applyConfig(
	context: ICommonContext,
	config: StudioConfig,
	coreConfig: BlueprintConfigCoreConfig
): BlueprintResultApplyStudioConfig {
	const parsedConfig = preprocessConfig(context, config, coreConfig)

	return {
		mappings: getMappingsDefaults(parsedConfig),
		playoutDevices: generatePlayoutDevices(parsedConfig),
		parentDevices: generateParentDevices(),
		inputDevices: {},
		ingestDevices: generateIngestDevices(),
	}
}

export function generateParentDevices(): Record<string, BlueprintParentDeviceSettings> {
	const parentDevices: BlueprintResultApplyStudioConfig['parentDevices'] = {
		playoutgateway: literal<BlueprintParentDeviceSettings>({
			name: 'playoutgateway',
			options: {},
		}),
	}

	return parentDevices
}

function generatePlayoutDevices(config: BlueprintConfig): Record<string, TSR.DeviceOptionsAny> {
	const playoutDevices: BlueprintResultApplyStudioConfig['playoutDevices'] = {
		['abstract']: literal<TSR.DeviceOptionsAbstract>({
			type: TSR.DeviceType.ABSTRACT,
		}),
		['graphics']: literal<TSR.DeviceOptionsHTTPSend>({
			type: TSR.DeviceType.HTTPSEND,
			options: {},
		}),
	}

	if (config.studio.visionMixer.type === VisionMixerDevice.Atem) {
		playoutDevices[config.studio.visionMixer.deviceId] = literal<TSR.DeviceOptionsAtem>({
			type: TSR.DeviceType.ATEM,
			options: {
				host: config.studio.visionMixer.host,
				port: config.studio.visionMixer.port,
			},
		})
	}

	playoutDevices[config.studio.audioMixer.deviceId] = literal<TSR.DeviceOptionsSisyfos>({
		type: TSR.DeviceType.SISYFOS,
		options: {
			host: config.studio.audioMixer.host,
			port: config.studio.audioMixer.port || 1176,
		},
	})
	return playoutDevices
}

function generateIngestDevices(): Record<string, BlueprintMosDeviceConfig> {
	const ingestDevices: Record<string, BlueprintMosDeviceConfig> = {}

	return ingestDevices
}
