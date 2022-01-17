import {
	BlueprintResultPart,
	ExpectedPackage,
	IBlueprintPiece,
	PieceLifespan,
	TSR,
} from '@sofie-automation/blueprints-integration'
import { PartContext } from '../../common/context'
import { changeExtension, literal, stripExtension } from '../../common/util'
import { AudioSourceType, StudioConfig } from '../../studio0/helpers/config'
import { CasparCGLayers } from '../../studio0/layers'
import { PartProps, VTProps } from '../definitions'
import { createAtemInputTimelineObjects } from '../helpers/atem'
import { getAudioPrimaryObject } from '../helpers/audio'
import { parseGraphicsFromObjects } from '../helpers/graphics'
import { createScriptPiece } from '../helpers/script'
import { getOutputLayerForSourceLayer, SourceLayer } from '../layers'

export function generateVTPart(context: PartContext, part: PartProps<VTProps>): BlueprintResultPart {
	const config = context.getStudioConfig() as StudioConfig

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
		content: {
			fileName: part.payload.clipProps.fileName,

			timelineObjects: [
				...createAtemInputTimelineObjects(5, config.casparcgLatency),

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

				audioTlObj,
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
	}
}
