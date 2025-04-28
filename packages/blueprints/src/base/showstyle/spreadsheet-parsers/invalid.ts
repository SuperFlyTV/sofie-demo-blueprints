import { ITranslatableMessage } from '@sofie-automation/blueprints-integration'
import { SomeObject } from '../../../common/definitions/objects'
import { SpreadsheetIngestPart } from '../../../copy/spreadsheet-gateway'
import { InvalidProps, PartInfo, PartProps, PartType } from '../definitions'
import { parseBaseProps } from './base'

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
