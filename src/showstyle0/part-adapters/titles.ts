import { BlueprintResultPart, IBlueprintPiece, PieceLifespan, TSR } from '@sofie-automation/blueprints-integration'
import { PartContext } from '../../common/context'
import { literal } from '../../common/util'
import { StudioConfig } from '../../studio0/helpers/config'
import { CasparCGLayers } from '../../studio0/layers'
import { PartProps, TitlesProps } from '../definitions'
import { createAtemInputTimelineObjects } from '../helpers/atem'
import { getClipPlayerInput } from '../helpers/clips'
import { createScriptPiece } from '../helpers/script'
import { getOutputLayerForSourceLayer, SourceLayer } from '../layers'

export function generateOpenerPart(context: PartContext, part: PartProps<TitlesProps>): BlueprintResultPart {
	const config = context.getStudioConfig() as StudioConfig
	const atemInput = getClipPlayerInput(config)

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

			timelineObjects: [
				...createAtemInputTimelineObjects(atemInput?.input || 0),

				// clip
				literal<TSR.TimelineObjCCGMedia>({
					id: '',
					enable: { start: 0 },
					layer: CasparCGLayers.CasparCGEffectsPlayer,
					content: {
						deviceType: TSR.DeviceType.CASPARCG,
						type: TSR.TimelineContentTypeCasparCg.MEDIA,

						file: 'assets/Sofie News Opener',
					},
				}),
			],
		},
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
				...createAtemInputTimelineObjects(atemInput?.input || 0),

				// clip
				literal<TSR.TimelineObjCCGMedia>({
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
				}),
			],
		},
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
			prerollDuration: config.casparcgLatency,
		},
		pieces,
		adLibPieces: [],
	}
}
