import { SomeObject } from '../../common/definitions/objects'
import { SpreadsheetIngestPart } from '../../copy/spreadsheet-gateway'
import { InvalidProps, PartInfo, PartProps, PartType, TitlesProps } from '../definitions'
import { parseBaseProps } from './base'

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
