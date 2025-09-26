import { GraphicObject, ObjectType, SomeObject } from '../../../common/definitions/objects.js'
import { t } from '../../../common/util.js'
import { SpreadsheetIngestPart } from '../../../code-copy/spreadsheet-gateway/index.js'
import { GfxProps, InvalidProps, PartInfo, PartProps, PartType } from '../definitions/index.js'
import { parseBaseProps } from './base.js'
import { createInvalidProps } from './invalid.js'

export function parseGfx(ingestPart: SpreadsheetIngestPart): PartProps<GfxProps | InvalidProps> {
	const gfxObject = ingestPart.pieces.find(
		(p): p is GraphicObject =>
			(p.objectType as ObjectType) === ObjectType.Graphic || (p.objectType as ObjectType) === ObjectType.SteppedGraphic
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
