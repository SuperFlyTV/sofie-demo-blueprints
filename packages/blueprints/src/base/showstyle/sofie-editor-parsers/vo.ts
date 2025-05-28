import { ObjectType, SomeObject, VideoObject } from '../../../common/definitions/objects.js'
import { t } from '../../../common/util.js'
import { EditorIngestPart } from '../../../code-copy/rundown-editor/index.js'
import { InvalidProps, PartInfo, PartProps, PartType, VOProps } from '../definitions/index.js'
import { parseClipEditorProps } from '../helpers/clips.js'
import { parseBaseProps } from './base.js'
import { createInvalidProps } from './invalid.js'

export function parseVO(ingestPart: EditorIngestPart): PartProps<VOProps | InvalidProps> {
	const videoObject = ingestPart.pieces.find((p): p is VideoObject => (p.objectType as ObjectType) === ObjectType.Video)
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
