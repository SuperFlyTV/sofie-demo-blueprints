import { IBlueprintAdLibPiece, IShowStyleUserContext, PieceLifespan } from '@sofie-automation/blueprints-integration'
import { assertUnreachable, literal } from '../../common/util'
import { AudioSourceType, SourceType, StudioConfig, VisionMixerType } from '../../studio0/helpers/config'
import { SisyfosLayers } from '../../studio0/layers'
import { adLibTagCamera, adLibTagLive, AdLibTags } from '../definitions'
import { getAudioObjectOnLayer, getAudioPrimaryObject } from '../helpers/audio'
import { createVisionMixerObjects } from '../helpers/visionMixer'
import { getOutputLayerForSourceLayer, SourceLayer } from '../layers'

export function getGlobalAdlibs(context: IShowStyleUserContext): IBlueprintAdLibPiece[] {
	const config = context.getStudioConfig() as StudioConfig

	const makeCameraAdlib = (id: number, input: number, queue: boolean): IBlueprintAdLibPiece => ({
		_rank: 100 + id,
		externalId: 'cam' + id,
		name: `Camera ${id + 1}`,
		lifespan: PieceLifespan.WithinPart,
		sourceLayerId: SourceLayer.Camera,
		outputLayerId: getOutputLayerForSourceLayer(SourceLayer.Camera),
		content: {
			timelineObjects: [
				...createVisionMixerObjects(config, input, 0),
				getAudioPrimaryObject(config, [{ type: AudioSourceType.Host, index: 0 }]),
			],
		},
		tags: [AdLibTags.Camera, adLibTagCamera((id + 1).toString()), queue ? AdLibTags.Queue : AdLibTags.DirectCut],
		toBeQueued: queue,
	})
	const makeRemoteAdlib = (id: number, input: number, queue: boolean): IBlueprintAdLibPiece => ({
		_rank: 200 + id,
		externalId: 'rem' + id,
		name: `Remote ${id + 1}`,
		lifespan: PieceLifespan.WithinPart,
		sourceLayerId: SourceLayer.Remote,
		outputLayerId: getOutputLayerForSourceLayer(SourceLayer.Camera),
		content: {
			timelineObjects: [
				...createVisionMixerObjects(config, input, 0),
				getAudioPrimaryObject(config, [{ type: AudioSourceType.Remote, index: id }]),
			],
		},
		tags: [AdLibTags.Live, adLibTagLive((id + 1).toString()), queue ? AdLibTags.Queue : AdLibTags.DirectCut],
		toBeQueued: queue,
	})

	const hostMicOverrides = [
		literal<IBlueprintAdLibPiece>({
			_rank: 301,
			externalId: 'Host Mics Up',
			name: `Host Mics Up`,
			lifespan: PieceLifespan.WithinPart,
			sourceLayerId: SourceLayer.HostOverride,
			outputLayerId: getOutputLayerForSourceLayer(SourceLayer.HostOverride),
			content: {
				timelineObjects: [
					getAudioObjectOnLayer(config, SisyfosLayers.HostOverride, [{ type: AudioSourceType.Host, index: 0 }]),
				],
			},
		}),
		literal<IBlueprintAdLibPiece>({
			_rank: 301,
			externalId: 'Host Mics Down',
			name: `Host Mics Down`,
			lifespan: PieceLifespan.WithinPart,
			sourceLayerId: SourceLayer.HostOverride,
			outputLayerId: getOutputLayerForSourceLayer(SourceLayer.HostOverride),
			content: {
				timelineObjects: [
					getAudioObjectOnLayer(config, SisyfosLayers.HostOverride, [
						{ type: AudioSourceType.Host, index: 0, isOn: false },
					]),
				],
			},
		}),
	]

	if (config.visionMixerType === VisionMixerType.Atem) {
		const cameraSources = config.atemSources.filter((source) => source.type === SourceType.Camera)
		const remoteSources = config.atemSources.filter((source) => source.type === SourceType.Remote)

		return [
			...cameraSources.map((source, i) => makeCameraAdlib(i, source.input, false)),
			...cameraSources.map((source, i) => makeCameraAdlib(i, source.input, true)),
			...remoteSources.map((source, i) => makeRemoteAdlib(i, source.input, false)),
			...remoteSources.map((source, i) => makeRemoteAdlib(i, source.input, true)),
			...hostMicOverrides,
		]
	} else if (config.visionMixerType === VisionMixerType.VMix) {
		const cameraSources = config.vmixSources.filter((source) => source.type === SourceType.Camera)
		const remoteSources = config.vmixSources.filter((source) => source.type === SourceType.Remote)

		return [
			...cameraSources.map((source, i) => makeCameraAdlib(i, source.input, false)),
			...cameraSources.map((source, i) => makeCameraAdlib(i, source.input, true)),
			...remoteSources.map((source, i) => makeRemoteAdlib(i, source.input, false)),
			...remoteSources.map((source, i) => makeRemoteAdlib(i, source.input, true)),
			...hostMicOverrides,
		]
	} else {
		assertUnreachable(config.visionMixerType)
	}
}
