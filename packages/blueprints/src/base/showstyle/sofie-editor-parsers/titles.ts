import { SomeObject } from '../../../common/definitions/objects.js'
import { EditorIngestPart } from '../../../code-copy/rundown-editor/index.js'
import { InvalidProps, PartInfo, PartProps, PartType, TitlesProps } from '../definitions/index.js'
import { parseBaseProps } from './base.js'

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
