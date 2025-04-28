import { SomeObject } from '../../../common/definitions/objects'
import { EditorIngestPart } from '../../../copy/rundown-editor'
import { InvalidProps, PartInfo, PartProps, PartType, TitlesProps } from '../definitions'
import { parseBaseProps } from './base'

export function parseOpener(ingestPart: EditorIngestPart): PartProps<TitlesProps | InvalidProps> {
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
