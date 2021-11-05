import { BlueprintResultPart, IBlueprintPiece, PieceLifespan } from '@sofie-automation/blueprints-integration'
import { PartContext } from '../../common/context'
import { ObjectType, StudioGuestObject } from '../../common/definitions/objects'
import { literal } from '../../common/util'
import { AudioSourceType, StudioConfig } from '../../studio0/helpers/config'
import { SisyfosLayers } from '../../studio0/layers'
import { CameraProps, PartProps } from '../definitions'
import { createAtemInputTimelineObjects } from '../helpers/atem'
import { getAudioObjectOnLayer, getAudioPrimaryObject } from '../helpers/audio'
import { parseClipsFromObjects } from '../helpers/clips'
import { parseGraphicsFromObjects } from '../helpers/graphics'
import { createScriptPiece } from '../helpers/script'
import { getSourceInfoFromRaw } from '../helpers/sources'
import { getOutputLayerForSourceLayer, SourceLayer } from '../layers'

export function generateCameraPart(context: PartContext, part: PartProps<CameraProps>): BlueprintResultPart {
	const config = context.getStudioConfig() as StudioConfig
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
			timelineObjects: [...createAtemInputTimelineObjects(sourceInfo.input), audioTlObj],
		},
	}

	const pieces = [cameraPiece]
	const scriptPiece = createScriptPiece(part.payload.script, part.payload.externalId)
	if (scriptPiece) pieces.push(scriptPiece)

	const graphics = parseGraphicsFromObjects(config, part.objects)
	if (graphics.pieces) pieces.push(...graphics.pieces)

	const clips = parseClipsFromObjects(config, part.objects)

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
