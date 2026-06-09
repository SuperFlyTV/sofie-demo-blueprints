import { BlueprintResultPart, IBlueprintPiece, PieceLifespan } from '@sofie-automation/blueprints-integration'
import { PartContext } from '../../../common/context.js'
import { ObjectType, StudioGuestObject } from '../../../common/definitions/objects.js'
import { literal } from '../../../common/util.js'
import { AudioSourceType, StudioConfig } from '../../studio/helpers/config.js'
import { SisyfosLayers } from '../../studio/layers.js'
import { CameraProps, PartProps } from '../definitions/index.js'
import { getAudioObjectOnLayer, getAudioPrimaryObject } from '../helpers/audio.js'
import { parseClipsFromObjects } from '../helpers/clips.js'
import { parseGraphicsFromObjects } from '../helpers/graphics.js'
import { createScriptPiece } from '../helpers/script.js'
import { getSourceInfoFromRaw } from '../helpers/sources.js'
import { createVisionMixerObjects } from '../helpers/visionMixer.js'
import { getOutputLayerForSourceLayer, SourceLayer } from '../applyconfig/layers.js'
import { parseConfig } from '../helpers/config.js'

export function generateCameraPart(context: PartContext, part: PartProps<CameraProps>): BlueprintResultPart {
	const config = parseConfig(context).studio
	const sourceInfo = getSourceInfoFromRaw(config, part.payload.input)

	const audioTlObj = getAudioPrimaryObject(config, [{ type: AudioSourceType.Host, index: 0 }]) // todo: all hosts?

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
			timelineObjects: [...createVisionMixerObjects(config, sourceInfo.input), audioTlObj],
		},
	}

	const pieces = [cameraPiece]
	const scriptPiece = createScriptPiece(part.payload.script, part.payload.externalId)
	if (scriptPiece) pieces.push(scriptPiece)

	const graphics = parseGraphicsFromObjects(config, part.objects)
	if (graphics.pieces) pieces.push(...graphics.pieces)

	const clips = parseClipsFromObjects(context, config, part.objects)

	const guestObj = part.objects.find((p): p is StudioGuestObject => p.objectType === ObjectType.StudioGuest)
	if (guestObj) {
		pieces.push(addGuest(config, guestObj.attributes.count))
	}

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

function addGuest(config: StudioConfig, count: number): IBlueprintPiece {
	const guests: { type: AudioSourceType.Guest; index: number }[] = []
	for (let i = 0; i < count; i++) guests.push({ type: AudioSourceType.Guest, index: i })
	const audioTlObj = getAudioObjectOnLayer(config, SisyfosLayers.Guests, guests)

	return literal<IBlueprintPiece>({
		enable: {
			start: 0,
		},
		externalId: '-',
		name: `Guest ${count}`,
		lifespan: PieceLifespan.OutOnSegmentEnd,
		sourceLayerId: SourceLayer.StudioGuests,
		outputLayerId: getOutputLayerForSourceLayer(SourceLayer.StudioGuests),
		content: {
			timelineObjects: [audioTlObj],
		},
	})
}
