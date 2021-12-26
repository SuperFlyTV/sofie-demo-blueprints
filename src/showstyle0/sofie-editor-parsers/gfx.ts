import { GraphicObject, ObjectType, SomeObject } from '../../common/definitions/objects'
import { t } from '../../common/util'
import { EditorIngestPart } from '../../copy/rundown-editor'
import { GfxProps, InvalidProps, PartInfo, PartProps, PartType } from '../definitions'
import { parseBaseProps } from './base'
import { createInvalidProps } from './invalid'

export function parseGfx(ingestPart: EditorIngestPart): PartProps<GfxProps | InvalidProps> {
	const gfxObject = ingestPart.pieces.find((p): p is GraphicObject => p.objectType === ObjectType.Graphic)
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
