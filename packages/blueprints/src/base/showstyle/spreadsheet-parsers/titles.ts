import { SomeObject } from '../../../common/definitions/objects.js'
import { SpreadsheetIngestPart } from '../../../code-copy/spreadsheet-gateway/index.js'
import { InvalidProps, PartInfo, PartProps, PartType, TitlesProps } from '../definitions/index.js'
import { parseBaseProps } from './base.js'

export function parseOpener(ingestPart: SpreadsheetIngestPart): PartProps<TitlesProps | InvalidProps> {
	return {
		type: PartType.Titles,
		rawType: ingestPart.type,
		rawTitle: ingestPart.name,
		info: PartInfo.NORMAL,
		objects: ingestPart.pieces as SomeObject[],
		payload: {
			...parseBaseProps(ingestPart),

			variant: '',
			duration: 5000,
		},
	}
}
