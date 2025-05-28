import { ITranslatableMessage } from '@sofie-automation/blueprints-integration'
import { SomeObject } from '../../../common/definitions/objects.js'
import { SpreadsheetIngestPart } from '../../../code-copy/spreadsheet-gateway/index.js'
import { InvalidProps, PartInfo, PartProps, PartType } from '../definitions/index.js'
import { parseBaseProps } from './base.js'

export function createInvalidProps(
	reason: ITranslatableMessage,
	ingestPart: SpreadsheetIngestPart
): PartProps<InvalidProps> {
	return {
		type: PartType.Invalid,
		rawType: ingestPart.type,
		rawTitle: ingestPart.name,
		info: PartInfo.NORMAL,
		objects: ingestPart.pieces as SomeObject[],
		payload: {
			...parseBaseProps(ingestPart),

			invalidReason: reason,
		},
	}
}
