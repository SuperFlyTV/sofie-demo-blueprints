import {
	BlueprintResultPart,
	ExpectedPackage,
	IBlueprintPiece,
	PieceLifespan,
	TSR,
} from '@sofie-automation/blueprints-integration'
import { PartContext } from '../../../common/context.js'
import { changeExtension, literal, stripExtension } from '../../../common/util.js'
import { AudioSourceType } from '../../studio/helpers/config.js'
import { CasparCGLayers } from '../../studio/layers.js'
import { PartProps, VTProps } from '../definitions/index.js'
import { getAudioPrimaryObject } from '../helpers/audio.js'
import { getClipPlayerInput } from '../helpers/clips.js'
import { parseGraphicsFromObjects } from '../helpers/graphics.js'
import { createScriptPiece } from '../helpers/script.js'
import { createVisionMixerObjects } from '../helpers/visionMixer.js'
import { getOutputLayerForSourceLayer, SourceLayer } from '../applyconfig/layers.js'
import { TimelineBlueprintExt } from '../../studio/customTypes.js'
import { parseConfig } from '../helpers/config.js'

export function generateVTPart(context: PartContext, part: PartProps<VTProps>): BlueprintResultPart {
	const config = parseConfig(context).studio
	const visionMixerInput = getClipPlayerInput(config)

	const audioTlObj = getAudioPrimaryObject(config, [{ type: AudioSourceType.Playback, index: 0 }]) // todo: which playback?

	const vtPiece: IBlueprintPiece = {
		enable: {
			start: 0,
		},
		externalId: part.payload.externalId,
		name: `${part.payload.clipProps?.fileName || 'Missing file name'}`,
		lifespan: PieceLifespan.WithinPart,
		sourceLayerId: SourceLayer.VT,
		outputLayerId: getOutputLayerForSourceLayer(SourceLayer.VT),
		abSessions: [
			{
				sessionName: part.payload.externalId,
				poolName: 'clip',
			},
		],
		content: {
			fileName: part.payload.clipProps.fileName,

			timelineObjects: [
				...createVisionMixerObjects(config, visionMixerInput?.input || 0, config.casparcgLatency),

				literal<TimelineBlueprintExt<TSR.TimelineContentCCGMedia>>({
					id: '',
					enable: { start: 0 },
					layer: CasparCGLayers.CasparCGClipPlayer1,
					content: {
						deviceType: TSR.DeviceType.CASPARCG,
						type: TSR.TimelineContentTypeCasparCg.MEDIA,

						file: stripExtension(part.payload.clipProps.fileName),
					},
					priority: 1,
				}),

				audioTlObj,
			],

			sourceDuration: part.payload.clipProps.sourceDuration,
		},
		expectedPackages: [
			literal<ExpectedPackage.ExpectedPackageMediaFile>({
				_id: context.getHashId(part.payload.clipProps.fileName, true),
				layers: [CasparCGLayers.CasparCGClipPlayer1],
				type: ExpectedPackage.PackageType.MEDIA_FILE,
				content: {
					filePath: part.payload.clipProps.fileName,
				},
				version: {},
				contentVersionHash: '',
				sources: [],
				sideEffect: {
					previewPackageSettings: {
						path: `previews/${changeExtension(part.payload.clipProps.fileName, 'webm')}`,
					},
					thumbnailPackageSettings: {
						path: `thumbnails/${changeExtension(part.payload.clipProps.fileName, 'jpg')}`,
						seekTime: 0,
					},
				},
			}),
		],
	}

	const pieces = [vtPiece]
	const scriptPiece = createScriptPiece(part.payload.script, part.payload.externalId)
	if (scriptPiece) pieces.push(scriptPiece)

	const graphics = parseGraphicsFromObjects(config, part.objects)
	if (graphics.pieces) pieces.push(...graphics.pieces)

	return {
		part: {
			externalId: part.payload.externalId,
			title: part.payload.name,

			expectedDuration: part.payload.duration,
			autoNext: true,
		},
		pieces,
		adLibPieces: [...graphics.adLibPieces],
		actions: [],
	}
}
