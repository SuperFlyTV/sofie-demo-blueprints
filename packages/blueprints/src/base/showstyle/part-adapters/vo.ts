import {
	BlueprintResultPart,
	ExpectedPackage,
	IBlueprintPiece,
	PieceLifespan,
	TSR,
} from '@sofie-automation/blueprints-integration'
import { PartContext } from '../../../common/context.js'
import { changeExtension, literal, stripExtension } from '../../../common/util.js'
import { CasparCGLayers } from '../../studio/layers.js'
import { PartProps, VOProps } from '../definitions/index.js'
import { getClipPlayerInput } from '../helpers/clips.js'
import { parseGraphicsFromObjects } from '../helpers/graphics.js'
import { createScriptPiece } from '../helpers/script.js'
import { createVisionMixerObjects } from '../helpers/visionMixer.js'
import { getOutputLayerForSourceLayer, SourceLayer } from '../applyconfig/layers.js'
import { TimelineBlueprintExt } from '../../studio/customTypes.js'
import { parseConfig } from '../helpers/config.js'

export function generateVOPart(context: PartContext, part: PartProps<VOProps>): BlueprintResultPart {
	const config = parseConfig(context).studio
	const atemInput = getClipPlayerInput(config)

	const cameraPiece: IBlueprintPiece = {
		enable: {
			start: 0,
		},
		externalId: part.payload.externalId,
		name: `${part.payload.clipProps.fileName || 'Missing file name'}`,
		lifespan: PieceLifespan.WithinPart,
		sourceLayerId: SourceLayer.VO,
		outputLayerId: getOutputLayerForSourceLayer(SourceLayer.VO),

		content: {
			fileName: part.payload.clipProps.fileName,

			timelineObjects: [
				...createVisionMixerObjects(config, atemInput?.input || 0, config.casparcgLatency),

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

	const pieces = [cameraPiece]
	const scriptPiece = createScriptPiece(part.payload.script, part.payload.externalId)
	if (scriptPiece) pieces.push(scriptPiece)

	const graphics = parseGraphicsFromObjects(config, part.objects)
	if (graphics.pieces) pieces.push(...graphics.pieces)

	return {
		part: {
			externalId: part.payload.externalId,
			title: part.payload.name,

			expectedDuration: part.payload.duration,
		},
		pieces,
		adLibPieces: [...graphics.adLibPieces],
		actions: [],
	}
}
