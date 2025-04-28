import { ObjectType, SomeObject, VideoObject } from '../../../common/definitions/objects'
import { t } from '../../../common/util'
import { EditorIngestPart } from '../../../code-copy/rundown-editor'
import { InvalidProps, PartInfo, PartProps, PartType, VOProps } from '../definitions'
import { parseClipEditorProps } from '../helpers/clips'
import { parseBaseProps } from './base'
import { createInvalidProps } from './invalid'

export function parseVO(ingestPart: EditorIngestPart): PartProps<VOProps | InvalidProps> {
	const videoObject = ingestPart.pieces.find((p): p is VideoObject => p.objectType === ObjectType.Video)
	if (!videoObject) {
		return createInvalidProps(t('No video object'), ingestPart)
	}

	const clipProps = parseClipEditorProps(videoObject)

	return {
		type: PartType.VO,
		rawType: ingestPart.type,
		rawTitle: ingestPart.name,
		info: PartInfo.NORMAL,
		objects: ingestPart.pieces as SomeObject[],
		payload: {
			...parseBaseProps(ingestPart),

			clipProps,
		},
	}
}
