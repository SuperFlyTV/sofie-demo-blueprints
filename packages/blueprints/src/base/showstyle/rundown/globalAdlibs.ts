import { IBlueprintAdLibPiece, IShowStyleUserContext, PieceLifespan } from '@sofie-automation/blueprints-integration'
import { assertUnreachable, literal } from '../../../common/util.js'
import { AudioSourceType, SourceType } from '../../studio/helpers/config.js'
import { getAudioObjectOnLayer, getAudioPrimaryObject } from '../helpers/audio.js'
import { createVisionMixerObjects } from '../helpers/visionMixer.js'
import { getOutputLayerForSourceLayer, SourceLayer } from '../applyconfig/layers.js'
import { InputConfig, VisionMixerDevice } from '../../../$schemas/generated/main-studio-config.js'
import { parseConfig } from '../helpers/config.js'
import { SisyfosLayers } from '../../studio/layers.js'

export function getGlobalAdlibs(context: IShowStyleUserContext): IBlueprintAdLibPiece[] {
	const config = parseConfig(context).studio

	context.logError('Global Adlib Studio Config: ' + JSON.stringify(config))

	context.logError('Making camera adlibs')
	const makeCameraAdlib = (id: number, input: number): IBlueprintAdLibPiece => ({
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
	})
	context.logError('Making remote adlibs')
	const makeRemoteAdlib = (id: number, input: number): IBlueprintAdLibPiece => ({
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
	})

	context.logError('Making host mic overrides')
	const hostMicOverrides: IBlueprintAdLibPiece<unknown, unknown>[] = [
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

	context.logError('Checking vision mixer type')
	context.logError('Vision mixer type: ' + config.visionMixer.type)
	context.logError('Vision mixer defined Types: ' + JSON.stringify(VisionMixerDevice))
	if (config.visionMixer.type === VisionMixerDevice.Atem) {
		context.logError('Vision mixer type is found: Atem')
		return [
			...Object.values<InputConfig>(config.atemSources)
				.filter((source) => source.type === SourceType.Camera)
				.map((source, i) => makeCameraAdlib(i, source.input)),
			...Object.values<InputConfig>(config.atemSources)
				.filter((source) => source.type === SourceType.Remote)
				.map((source, i) => makeRemoteAdlib(i, source.input)),
			...hostMicOverrides,
		]
	} else if (config.visionMixer.type === VisionMixerDevice.VMix) {
		context.logError('Vision mixer type is found: VMix')
		return [
			...Object.values<InputConfig>(config.vmixSources)
				.filter((source) => source.type === SourceType.Camera)
				.map((source, i) => makeCameraAdlib(i, source.input)),
			...Object.values<InputConfig>(config.vmixSources)
				.filter((source) => source.type === SourceType.Remote)
				.map((source, i) => makeRemoteAdlib(i, source.input)),
			...hostMicOverrides,
		]
	} else {
		assertUnreachable(config.visionMixer.type)
	}
}
