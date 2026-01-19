import { BlueprintResultPart, IBlueprintPiece, PieceLifespan } from '@sofie-automation/blueprints-integration'
import { PartContext } from '../../../common/context.js'
import { AudioSourceType } from '../../studio/helpers/config.js'
import { PartProps, RemoteProps } from '../definitions/index.js'
import { getAudioPrimaryObject } from '../helpers/audio.js'
import { parseClipsFromObjects } from '../helpers/clips.js'
import { parseGraphicsFromObjects } from '../helpers/graphics.js'
import { createScriptPiece } from '../helpers/script.js'
import { getSourceInfoFromRaw } from '../helpers/sources.js'
import { createVisionMixerObjects } from '../helpers/visionMixer.js'
import { getOutputLayerForSourceLayer, SourceLayer } from '../applyconfig/layers.js'
import { ObjectType } from '../../../common/definitions/objects.js'
import { parseConfig } from '../helpers/config.js'

export function generateRemotePart(context: PartContext, part: PartProps<RemoteProps>): BlueprintResultPart {
	const config = parseConfig(context).studio
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
				part.objects.filter((o) => o.objectType === ObjectType.Graphic),
				undefined,
				4
			)
	)

	const graphics = parseGraphicsFromObjects(config, part.objects)
	if (graphics.pieces) pieces.push(...graphics.pieces)

	const clips = parseClipsFromObjects(context, config, part.objects)

	return {
		part: {
			externalId: part.payload.externalId,
			title: part.payload.name,

			expectedDuration: part.payload.duration,
		},
		pieces,
		adLibPieces: [...graphics.adLibPieces, ...clips],
		actions: [],
	}
}
