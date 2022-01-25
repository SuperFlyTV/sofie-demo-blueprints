import { BlueprintResultPart, IBlueprintPiece, PieceLifespan } from '@sofie-automation/blueprints-integration'
import { PartContext } from '../../common/context'
import { AudioSourceType, StudioConfig } from '../../studio0/helpers/config'
import { PartProps, RemoteProps } from '../definitions'
import { getAudioPrimaryObject } from '../helpers/audio'
import { parseClipsFromObjects } from '../helpers/clips'
import { parseGraphicsFromObjects } from '../helpers/graphics'
import { createScriptPiece } from '../helpers/script'
import { getSourceInfoFromRaw } from '../helpers/sources'
import { createVisionMixerObjects } from '../helpers/visionMixer'
import { getOutputLayerForSourceLayer, SourceLayer } from '../layers'

export function generateRemotePart(context: PartContext, part: PartProps<RemoteProps>): BlueprintResultPart {
	const config = context.getStudioConfig() as StudioConfig
	const sourceInfo = getSourceInfoFromRaw(config, part.payload.input)

	const audioTlObj = getAudioPrimaryObject(config, [{ type: AudioSourceType.Remote, index: part.payload.input.id - 1 }]) // todo: all hosts?

	const cameraPiece: IBlueprintPiece = {
		enable: {
			start: 0,
		},
		externalId: part.payload.externalId,
		name: `Rem ${sourceInfo.id}`,
		lifespan: PieceLifespan.WithinPart,
		sourceLayerId: SourceLayer.Remote,
		outputLayerId: getOutputLayerForSourceLayer(SourceLayer.Remote),
		content: {
			timelineObjects: [...createVisionMixerObjects(config, sourceInfo.input), audioTlObj],
		},
	}

	const pieces = [cameraPiece]
	const scriptPiece = createScriptPiece(part.payload.script, part.payload.externalId)
	if (scriptPiece) pieces.push(scriptPiece)

	context.logDebug(
		'objects ' +
			JSON.stringify(
				part.objects.filter((o) => o.objectType === 'graphic'),
				undefined,
				4
			)
	)

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
