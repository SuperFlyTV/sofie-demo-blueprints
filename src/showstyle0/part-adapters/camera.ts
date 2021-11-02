import { BlueprintResultPart, IBlueprintPiece, PieceLifespan } from '@sofie-automation/blueprints-integration'
import { PartContext } from '../../common/context'
import { StudioConfig } from '../../studio0/helpers/config'
import { CameraProps, PartProps } from '../definitions'
import { createAtemInputTimelineObjects } from '../helpers/atem'
import { parseClipsFromObjects } from '../helpers/clips'
import { parseGraphicsFromObjects } from '../helpers/graphics'
import { createScriptPiece } from '../helpers/script'
import { getSourceInfoFromRaw } from '../helpers/sources'
import { getOutputLayerForSourceLayer, SourceLayer } from '../layers'

export function generateCameraPart(context: PartContext, part: PartProps<CameraProps>): BlueprintResultPart {
	const config = context.getStudioConfig() as StudioConfig
	const sourceInfo = getSourceInfoFromRaw(config, part.payload.input)

	const cameraPiece: IBlueprintPiece = {
		enable: {
			start: 0,
		},
		externalId: part.payload.externalId,
		name: `Cam ${sourceInfo.id}`,
		lifespan: PieceLifespan.WithinPart,
		sourceLayerId: SourceLayer.Camera,
		outputLayerId: getOutputLayerForSourceLayer(SourceLayer.Camera),
		content: {
			timelineObjects: [...createAtemInputTimelineObjects(sourceInfo.input)],
		},
	}

	const pieces = [cameraPiece]
	const scriptPiece = createScriptPiece(part.payload.script, part.payload.externalId)
	if (scriptPiece) pieces.push(scriptPiece)

	const graphics = parseGraphicsFromObjects(config, part.objects)
	if (graphics.pieces) pieces.push(...graphics.pieces)

	const clips = parseClipsFromObjects(config, part.objects)

	return {
		part: {
			externalId: part.payload.externalId,
			title: part.payload.name,

			expectedDuration: part.payload.duration,
		},
		pieces,
		adLibPieces: [...graphics.adLibPieces, ...clips],
	}
}
