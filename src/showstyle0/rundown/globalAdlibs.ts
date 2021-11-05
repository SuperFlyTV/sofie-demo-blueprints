import { IBlueprintAdLibPiece, IShowStyleUserContext, PieceLifespan } from '@sofie-automation/blueprints-integration'
import { literal } from '../../common/util'
import { AtemSourceType, AudioSourceType, StudioConfig } from '../../studio0/helpers/config'
import { SisyfosLayers } from '../../studio0/layers'
import { createAtemInputTimelineObjects } from '../helpers/atem'
import { getAudioObjectOnLayer, getAudioPrimaryObject } from '../helpers/audio'
import { getOutputLayerForSourceLayer, SourceLayer } from '../layers'

export function getGlobalAdlibs(context: IShowStyleUserContext): IBlueprintAdLibPiece[] {
	const config = context.getStudioConfig() as StudioConfig

	const makeCameraAdlib = (id: number, input: number): IBlueprintAdLibPiece => ({
		_rank: 100 + id,
		externalId: 'cam' + id,
		name: `Camera ${id + 1}`,
		lifespan: PieceLifespan.WithinPart,
		sourceLayerId: SourceLayer.Camera,
		outputLayerId: getOutputLayerForSourceLayer(SourceLayer.Camera),
		content: {
			timelineObjects: [
				...createAtemInputTimelineObjects(input, 0),
				getAudioPrimaryObject(config, [{ type: AudioSourceType.Host, index: 0 }]),
			],
		},
	})
	const makeRemoteAdlib = (id: number, input: number): IBlueprintAdLibPiece => ({
		_rank: 200 + id,
		externalId: 'rem' + id,
		name: `Remote ${id + 1}`,
		lifespan: PieceLifespan.WithinPart,
		sourceLayerId: SourceLayer.Remote,
		outputLayerId: getOutputLayerForSourceLayer(SourceLayer.Camera),
		content: {
			timelineObjects: [
				...createAtemInputTimelineObjects(input, 0),
				getAudioPrimaryObject(config, [{ type: AudioSourceType.Remote, index: id }]),
			],
		},
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

	return [
		...config.atemSources
			.filter((source) => source.type === AtemSourceType.Camera)
			.map((source, i) => makeCameraAdlib(i, source.input)),
		...config.atemSources
			.filter((source) => source.type === AtemSourceType.Remote)
			.map((source, i) => makeRemoteAdlib(i, source.input)),
		...hostMicOverrides,
	]
}
