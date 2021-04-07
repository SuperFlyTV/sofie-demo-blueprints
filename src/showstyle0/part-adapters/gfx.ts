import { BlueprintResultPart } from '@sofie-automation/blueprints-integration'
import { PartContext } from '../../common/context'
import { StudioConfig } from '../../studio0/helpers/config'
import { GfxProps, PartProps } from '../definitions'
import { getClipPlayerInput } from '../helpers/clips'
import { parseGraphicsFromObjects } from '../helpers/graphics'
import { createScriptPiece } from '../helpers/script'

export function generateGfxPart(context: PartContext, part: PartProps<GfxProps>): BlueprintResultPart {
	const config = context.getStudioConfig() as StudioConfig
	const atemInput = getClipPlayerInput(config)

	const graphic = parseGraphicsFromObjects([part.payload.graphic], atemInput?.input)
	if (!graphic.pieces[0]) context.notifyUserError('Missing fullscreen graphic')

	const fullscreenPiece = graphic.pieces[0]

	const pieces = [fullscreenPiece]
	const scriptPiece = createScriptPiece(part.payload.script, part.payload.externalId)
	if (scriptPiece) pieces.push(scriptPiece)

	const graphics = parseGraphicsFromObjects(part.objects)
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
