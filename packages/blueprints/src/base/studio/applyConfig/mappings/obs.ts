import { BlueprintMapping, BlueprintMappings, LookaheadMode, TSR } from '@sofie-automation/blueprints-integration'
import { literal } from '../../../../common/util.js'
import { ObsSourceConfig } from '../../../../$schemas/generated/main-studio-config.js'
import { StudioConfig } from '../../helpers/config.js'
import { getOBSClipMediaPlayerSourceIds } from '../../helpers/obsSources.js'
import { OBSLayers } from '../../layers.js'

export function getOBSInputSettingsLayer(sourceId: string): string {
	return `obs_input_settings_${sourceId}`
}

export function getOBSInputMediaLayer(sourceId: string): string {
	return `obs_input_media_${sourceId}`
}

export function getOBSInputAudioLayer(sourceId: string): string {
	return `obs_input_audio_${sourceId}`
}

export function getOBSInputSettingsABPendingLayer(): string {
	return 'obs_input_settings_ab_pending'
}

export function getOBSInputMediaABPendingLayer(): string {
	return 'obs_input_media_ab_pending'
}

export function getOBSInputAudioABPendingLayer(): string {
	return 'obs_input_audio_ab_pending'
}

export function getOBSCurrentSceneLookaheadLayer(): string {
	return `${OBSLayers.OBSCurrentScene}_lookahead`
}

export function getOBSSceneItemLayer(sourceId: string): string {
	return `obs_scene_item_${sourceId}`
}

export function getOBSAudioInputName(source: { sourceName: string; audioSourceName?: string }): string {
	return source.audioSourceName || ''
}

export function getOBSMappings(config: StudioConfig): BlueprintMappings {
	const deviceId = config.visionMixer.deviceId
	const clipPlayerPoolSize = getOBSClipMediaPlayerSourceIds(config).length || 1
	const mappings: BlueprintMappings = {
		[OBSLayers.OBSCurrentScene]: literal<BlueprintMapping<TSR.MappingObsCurrentScene>>({
			device: TSR.DeviceType.OBS,
			deviceId,
			lookahead: LookaheadMode.PRELOAD,
			lookaheadMaxSearchDistance: 1,
			lookaheadDepth: 1,
			options: { mappingType: TSR.MappingObsType.CurrentScene },
		}),
		[getOBSCurrentSceneLookaheadLayer()]: literal<BlueprintMapping<TSR.MappingObsCurrentScene>>({
			device: TSR.DeviceType.OBS,
			deviceId,
			lookahead: LookaheadMode.NONE,
			options: { mappingType: TSR.MappingObsType.CurrentScene },
		}),
		[OBSLayers.OBSCurrentTransition]: literal<BlueprintMapping<TSR.MappingObsCurrentTransition>>({
			device: TSR.DeviceType.OBS,
			deviceId,
			lookahead: LookaheadMode.NONE,
			options: { mappingType: TSR.MappingObsType.CurrentTransition },
		}),
		[OBSLayers.OBSDownstreamKeyer]: literal<BlueprintMapping<TSR.MappingObsDownstreamKeyer>>({
			device: TSR.DeviceType.OBS,
			deviceId,
			lookahead: LookaheadMode.NONE,
			options: { mappingType: TSR.MappingObsType.DownstreamKeyer },
		}),
	}

	mappings[getOBSInputSettingsABPendingLayer()] = literal<BlueprintMapping<TSR.SomeMappingAbstract>>({
		device: TSR.DeviceType.ABSTRACT,
		deviceId: 'abstract0',
		lookahead: LookaheadMode.WHEN_CLEAR,
		lookaheadMaxSearchDistance: clipPlayerPoolSize,
		lookaheadDepth: clipPlayerPoolSize,
		options: {},
	})
	mappings[getOBSInputMediaABPendingLayer()] = literal<BlueprintMapping<TSR.SomeMappingAbstract>>({
		device: TSR.DeviceType.ABSTRACT,
		deviceId: 'abstract0',
		// OBS media players are filled while clear; the assigned future media object is paused until on-air.
		lookahead: LookaheadMode.WHEN_CLEAR,
		lookaheadMaxSearchDistance: clipPlayerPoolSize,
		lookaheadDepth: clipPlayerPoolSize,
		options: {},
	})
	mappings[getOBSInputAudioABPendingLayer()] = literal<BlueprintMapping<TSR.SomeMappingAbstract>>({
		device: TSR.DeviceType.ABSTRACT,
		deviceId: 'abstract0',
		lookahead: LookaheadMode.NONE,
		options: {},
	})

	for (const [sourceId, source] of Object.entries<ObsSourceConfig>(config.obsSources)) {
		if (source.sourceName) {
			mappings[getOBSInputSettingsLayer(sourceId)] = literal<BlueprintMapping<TSR.MappingObsInputSettings>>({
				device: TSR.DeviceType.OBS,
				deviceId,
				lookahead: LookaheadMode.NONE,
				options: { mappingType: TSR.MappingObsType.InputSettings, input: source.sourceName },
			})
			mappings[getOBSInputMediaLayer(sourceId)] = literal<BlueprintMapping<TSR.MappingObsInputMedia>>({
				device: TSR.DeviceType.OBS,
				deviceId,
				lookahead: LookaheadMode.NONE,
				options: { mappingType: TSR.MappingObsType.InputMedia, input: source.sourceName },
			})
		}

		const audioSourceName = getOBSAudioInputName(source)
		if (audioSourceName) {
			mappings[getOBSInputAudioLayer(sourceId)] = literal<BlueprintMapping<TSR.MappingObsInputAudio>>({
				device: TSR.DeviceType.OBS,
				deviceId,
				lookahead: LookaheadMode.NONE,
				options: { mappingType: TSR.MappingObsType.InputAudio, input: audioSourceName },
			})
		}

		if (source.sceneName && source.sourceName) {
			mappings[getOBSSceneItemLayer(sourceId)] = literal<BlueprintMapping<TSR.MappingObsSceneItem>>({
				device: TSR.DeviceType.OBS,
				deviceId,
				lookahead: LookaheadMode.NONE,
				options: {
					mappingType: TSR.MappingObsType.SceneItem,
					sceneName: source.sceneName,
					source: source.sourceName,
				},
			})
		}
	}

	return mappings
}
