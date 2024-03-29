import { BlueprintResultPart } from '@sofie-automation/blueprints-integration'
import { PartContext } from '../../common/context'
import { StudioConfig } from '../../studio0/helpers/config'
import { GfxProps, PartProps } from '../definitions'
import { parseClipsFromObjects } from '../helpers/clips'
import { parseGraphicsFromObjects } from '../helpers/graphics'
import { createScriptPiece } from '../helpers/script'

export function generateGfxPart(context: PartContext, part: PartProps<GfxProps>): BlueprintResultPart {
	const config = context.getStudioConfig() as StudioConfig

	const graphic = parseGraphicsFromObjects(config, [part.payload.graphic])
	if (!graphic.pieces[0]) context.notifyUserError('Missing fullscreen graphic')

	const fullscreenPiece = graphic.pieces[0]

	const pieces = [fullscreenPiece]
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
			autoNext: true,
		},
		pieces,
		adLibPieces: [...graphics.adLibPieces, ...clips],
		actions: [],
	}
}
