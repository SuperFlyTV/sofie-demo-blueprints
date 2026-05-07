import {
	Accessor,
	BlueprintConfigCoreConfig,
	BlueprintParentDeviceSettings,
	BlueprintResultApplyStudioConfig,
	ICommonContext,
	TSR,
} from '@sofie-automation/blueprints-integration'
import { BlueprintConfig, StudioConfig, VisionMixerDevice } from '../helpers/config.js'
import { getMappingsDefaults } from './mappings/index.js'
import { preprocessConfig } from '../preprocessConfig.js'
import { literal } from '../../../common/util.js'
// eslint-disable-next-line n/no-missing-import
import { StudioPackageContainer } from '@sofie-automation/shared-lib/dist/core/model/PackageContainer.js'

export function applyConfig(
	context: ICommonContext,
	config: StudioConfig,
	coreConfig: BlueprintConfigCoreConfig
): BlueprintResultApplyStudioConfig {
	const parsedConfig = preprocessConfig(context, config, coreConfig)

	return {
		mappings: getMappingsDefaults(context, parsedConfig),
		playoutDevices: generatePlayoutDevices(parsedConfig),
		parentDevices: generateParentDevices(),
		inputDevices: {},
		ingestDevices: generateIngestDevices(),

		packageContainers: generatePackageContainers(parsedConfig),

		studioSettings: {
			frameRate: 25,
			mediaPreviewsUrl: '',
			forceMultiGatewayMode: true,
			supportedMediaFormats: '1280x720p5000',
			minimumTakeSpan: 1000,

			allowHold: false,
			allowPieceDirectPlay: false,
			enableBuckets: false,
			enableEvaluationForm: true,
		},
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

function generatePlayoutDevices(config: BlueprintConfig): BlueprintResultApplyStudioConfig['playoutDevices'] {
	const playoutDevices: BlueprintResultApplyStudioConfig['playoutDevices'] = {
		abstract: {
			parentConfigId: 'playoutgateway',
			options: literal<TSR.DeviceOptionsAbstract>({
				type: TSR.DeviceType.ABSTRACT,
			}),
		},
		ograf0: {
			parentConfigId: 'playoutgateway',
			options: literal<any>({
				type: ((TSR.DeviceType as any).OGRAF ?? 'OGRAF') as TSR.DeviceType,
				options: {
					url: config.studio.ografBaseUrl || 'http://localhost:8080',
				},
			}),
		},
	}

	if (config.studio.visionMixer.type !== VisionMixerDevice.OBS) {
		playoutDevices.casparcg0 = {
			parentConfigId: 'playoutgateway',
			options: literal<TSR.DeviceOptionsCasparCG>({
				type: TSR.DeviceType.CASPARCG,
				options: {
					host: config.studio.casparcg.host,
					port: config.studio.casparcg.port || 5250,
				},
			}),
		}
	}

	if (config.studio.visionMixer.type === VisionMixerDevice.Atem) {
		playoutDevices[config.studio.visionMixer.deviceId] = {
			parentConfigId: 'playoutgateway',
			options: literal<TSR.DeviceOptionsAtem>({
				type: TSR.DeviceType.ATEM,
				options: {
					host: config.studio.visionMixer.host,
					port: config.studio.visionMixer.port,
				},
			}),
		}
	} else if (config.studio.visionMixer.type === VisionMixerDevice.VMix) {
		playoutDevices[config.studio.visionMixer.deviceId] = {
			parentConfigId: 'playoutgateway',
			options: literal({
				type: TSR.DeviceType.VMIX,
				options: {
					host: config.studio.visionMixer.host,
					port: config.studio.visionMixer.port,
				},
			}),
		}
	} else if (config.studio.visionMixer.type === VisionMixerDevice.OBS) {
		playoutDevices[config.studio.visionMixer.deviceId] = {
			parentConfigId: 'playoutgateway',
			options: literal<TSR.DeviceOptionsObs>({
				type: TSR.DeviceType.OBS,
				options: {
					host: config.studio.visionMixer.host,
					port: config.studio.visionMixer.port,
					password: config.studio.visionMixer.password || undefined,
				},
			}),
		}
	}

	if (config.studio.visionMixer.type !== VisionMixerDevice.OBS) {
		playoutDevices[config.studio.audioMixer.deviceId] = {
			parentConfigId: 'playoutgateway',
			options: literal<TSR.DeviceOptionsSisyfos>({
				type: TSR.DeviceType.SISYFOS,
				options: {
					host: config.studio.audioMixer.host,
					port: config.studio.audioMixer.port || 1176,
				},
			}),
		}
	}

	return playoutDevices
}

function generateIngestDevices(): BlueprintResultApplyStudioConfig['ingestDevices'] {
	const ingestDevices: BlueprintResultApplyStudioConfig['ingestDevices'] = {}

	return ingestDevices
}

function generatePackageContainers(config: BlueprintConfig): Record<string, StudioPackageContainer> {
	const containers: Record<string, StudioPackageContainer> = {
		httpProxy0: {
			deviceIds: [],
			container: {
				label: 'Proxy for thumbnails & preview',
				accessors: {
					http0: {
						type: Accessor.AccessType.HTTP_PROXY,
						label: 'HTTP',
						allowRead: true,
						allowWrite: true,
						baseUrl: 'http://localhost:8080/package', // TODO - config driven?
					},
				},
			},
		},
	}

	if (config.studio.visionMixer.type !== VisionMixerDevice.OBS) {
		containers.casparcg0 = {
			deviceIds: ['casparcg0'],
			container: {
				label: 'CasparCG Media folder',
				accessors: {
					casparcg0: {
						type: Accessor.AccessType.LOCAL_FOLDER,
						label: 'Local',
						allowRead: true,
						allowWrite: false,
						folderPath: 'c:/casparcg/media', // TODO - config driven?
					},
				},
			},
		}
	}

	return containers
}
