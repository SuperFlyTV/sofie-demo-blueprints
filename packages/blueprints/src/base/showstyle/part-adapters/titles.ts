import {
	BlueprintResultPart,
	ExpectedPackage,
	IBlueprintPiece,
	PieceLifespan,
	TSR,
} from '@sofie-automation/blueprints-integration'
import { PartContext } from '../../../common/context.js'
import { literal } from '../../../common/util.js'
import { CasparCGLayers } from '../../studio/layers.js'
import { PartProps, TitlesProps } from '../definitions/index.js'
import { getClipPlayerInput } from '../helpers/clips.js'
import { createScriptPiece } from '../helpers/script.js'
import { createVisionMixerObjects } from '../helpers/visionMixer.js'
import { getOutputLayerForSourceLayer, SourceLayer } from '../applyconfig/layers.js'
import { TimelineBlueprintExt } from '../../studio/customTypes.js'
import { parseConfig } from '../helpers/config.js'

export function generateOpenerPart(context: PartContext, part: PartProps<TitlesProps>): BlueprintResultPart {
	const config = parseConfig(context).studio
	const visionMixerInput = getClipPlayerInput(config)

	const cameraPiece: IBlueprintPiece = {
		enable: {
			start: 0,
		},
		externalId: part.payload.externalId,
		name: `Titles`,
		lifespan: PieceLifespan.WithinPart,
		sourceLayerId: SourceLayer.Titles,
		outputLayerId: getOutputLayerForSourceLayer(SourceLayer.Titles),

		content: {
			fileName: 'assets/Sofie News Opener',

			/**
			 * The opener video file does not have an audio track,
			 * so we set this to true to suppress the "missing audio" warning
			 * in the Rundown view.
			 */
			ignoreAudioFormat: true,

			timelineObjects: [
				...createVisionMixerObjects(config, visionMixerInput?.input || 0),

				// clip
				literal<TimelineBlueprintExt<TSR.TimelineContentCCGMedia>>({
					id: '',
					enable: { start: 0 },
					layer: CasparCGLayers.CasparCGEffectsPlayer,
					content: {
						deviceType: TSR.DeviceType.CASPARCG,
						type: TSR.TimelineContentTypeCasparCg.MEDIA,

						file: 'assets/Sofie News Opener',
					},
					priority: 1,
				}),
			],
		},

		expectedPackages: [
			literal<ExpectedPackage.ExpectedPackageMediaFile>({
				_id: context.getHashId('assets/Sofie News Opener.mp4', true),
				layers: [CasparCGLayers.CasparCGClipPlayer1],
				type: ExpectedPackage.PackageType.MEDIA_FILE,
				content: {
					filePath: 'assets/Sofie News Opener.mp4',
				},
				version: {},
				contentVersionHash: '',
				sources: [],
				sideEffect: {
					previewPackageSettings: {
						path: 'previews/assets/Sofie News Opener.webm',
					},
					thumbnailPackageSettings: {
						path: 'thumbnails/assets/Sofie News Opener.jpg',
						seekTime: 1500,
					},
				},
			}),
		],

		prerollDuration: config.casparcgLatency,
	}

	const audioBedPiece = literal<IBlueprintPiece>({
		enable: {
			start: 0,
		},
		externalId: part.payload.externalId,
		name: `Audiobed`,
		lifespan: PieceLifespan.OutOnSegmentEnd,
		sourceLayerId: SourceLayer.AudioBed,
		outputLayerId: getOutputLayerForSourceLayer(SourceLayer.AudioBed),

		content: {
			fileName: 'assets/Sofie News Opener Audio Bed',

			timelineObjects: [
				...createVisionMixerObjects(config, visionMixerInput?.input || 0),

				// clip
				literal<TimelineBlueprintExt<TSR.TimelineContentCCGMedia>>({
					id: '',
					enable: { start: 0 },
					layer: CasparCGLayers.CasparCGAudioBed,
					content: {
						deviceType: TSR.DeviceType.CASPARCG,
						type: TSR.TimelineContentTypeCasparCg.MEDIA,

						file: 'assets/Sofie News Opener Audio Bed',

						noStarttime: true,

						transitions: {
							outTransition: {
								type: TSR.Transition.MIX,
								duration: 1500,
							},
						},
					},
					priority: 1,
				}),
			],
		},

		expectedPackages: [
			literal<ExpectedPackage.ExpectedPackageMediaFile>({
				_id: context.getHashId('assets/Sofie News Opener Audio Bed.wav', true),
				layers: [CasparCGLayers.CasparCGClipPlayer1],
				type: ExpectedPackage.PackageType.MEDIA_FILE,
				content: {
					filePath: 'assets/Sofie News Opener Audio Bed.wav',
				},
				version: {},
				contentVersionHash: '',
				sources: [],
				sideEffect: {
					// HACK: Disable preview and thumbnail generation.
					// Once release39 is out, we can remove the "as any" from these values, and it will no longer be a hack.
					// https://github.com/nrkno/tv-automation-server-core/commit/5e0a9c36c628be92370c035f78c8a8f278debbfa
					previewContainerId: null as any,
					thumbnailContainerId: null as any,
				},
			}),
		],

		prerollDuration: config.casparcgLatency,
	})

	const pieces = [cameraPiece, audioBedPiece]
	const scriptPiece = createScriptPiece(part.payload.script, part.payload.externalId)
	if (scriptPiece) pieces.push(scriptPiece)

	return {
		part: {
			externalId: part.payload.externalId,
			title: part.payload.name,

			expectedDuration: part.payload.duration,
			autoNext: true,
		},
		pieces,
		adLibPieces: [],
		actions: [],
	}
}
