import { GraphicObjectBase, ObjectType, SomeObject } from '../../../common/definitions/objects.js'
import { t } from '../../../common/util.js'
import { EditorIngestPart } from '../../../code-copy/rundown-editor/index.js'
import { GfxProps, InvalidProps, PartInfo, PartProps, PartType } from '../definitions/index.js'
import { parseBaseProps } from './base.js'
import { createInvalidProps } from './invalid.js'

export function parseGfx(ingestPart: EditorIngestPart): PartProps<GfxProps | InvalidProps> {
	const gfxObject = ingestPart.pieces.find(
		(p): p is GraphicObjectBase =>
			(p.objectType as ObjectType) === ObjectType.Graphic ||
			(p.objectType as ObjectType) === ObjectType.SteppedGraphic ||
			(p.objectType as ObjectType) === ObjectType.OGrafGraphic
	)
	if (!gfxObject) {
		return createInvalidProps(t('No graphic object'), ingestPart)
	}

	return {
		type: PartType.GFX,
		rawType: ingestPart.type,
		rawTitle: ingestPart.name,
		info: PartInfo.NORMAL,
		objects: ingestPart.pieces as SomeObject[],
		payload: {
			...parseBaseProps(ingestPart),

			graphic: gfxObject,
		},
	}
}
