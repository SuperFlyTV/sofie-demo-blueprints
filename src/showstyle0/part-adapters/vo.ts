import {
	BlueprintResultPart,
	ExpectedPackage,
	IBlueprintPiece,
	PieceLifespan,
	TSR,
} from '@sofie-automation/blueprints-integration'
import { PartContext } from '../../common/context'
import { changeExtension, literal, stripExtension } from '../../common/util'
import { StudioConfig } from '../../studio0/helpers/config'
import { CasparCGLayers } from '../../studio0/layers'
import { PartProps, VOProps } from '../definitions'
import { getClipPlayerInput } from '../helpers/clips'
import { parseGraphicsFromObjects } from '../helpers/graphics'
import { createScriptPiece } from '../helpers/script'
import { createVisionMixerObjects } from '../helpers/visionMixer'
import { getOutputLayerForSourceLayer, SourceLayer } from '../layers'

export function generateVOPart(context: PartContext, part: PartProps<VOProps>): BlueprintResultPart {
	const config = context.getStudioConfig() as StudioConfig
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

				literal<TSR.TimelineObjCCGMedia>({
					id: '',
					enable: { start: 0 },
					layer: CasparCGLayers.CasparCGClipPlayer,
					content: {
						deviceType: TSR.DeviceType.CASPARCG,
						type: TSR.TimelineContentTypeCasparCg.MEDIA,

						file: stripExtension(part.payload.clipProps.fileName),
					},
				}),
			],

			sourceDuration: part.payload.clipProps.sourceDuration,
		},

		expectedPackages: [
			literal<ExpectedPackage.ExpectedPackageMediaFile>({
				_id: context.getHashId(part.payload.clipProps.fileName, true),
				layers: [CasparCGLayers.CasparCGClipPlayer],
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
	}
}
