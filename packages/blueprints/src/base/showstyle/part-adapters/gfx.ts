import { BlueprintResultPart } from '@sofie-automation/blueprints-integration'
import { PartContext } from '../../../common/context.js'
import { StudioConfig } from '../../studio/helpers/config.js'
import { GfxProps, PartProps } from '../definitions/index.js'
import { parseClipsFromObjects } from '../helpers/clips.js'
import { parseGraphicsFromObjects } from '../helpers/graphics.js'
import { createScriptPiece } from '../helpers/script.js'

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
