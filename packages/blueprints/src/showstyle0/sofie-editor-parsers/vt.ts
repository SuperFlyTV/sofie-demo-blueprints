import { ObjectType, SomeObject, VideoObject } from '../../common/definitions/objects'
import { t } from '../../common/util'
import { EditorIngestPart } from '../../copy/rundown-editor'
import { InvalidProps, PartInfo, PartProps, PartType, VTProps } from '../definitions'
import { parseClipEditorProps } from '../helpers/clips'
import { parseBaseProps } from './base'
import { createInvalidProps } from './invalid'

export function parseVT(ingestPart: EditorIngestPart): PartProps<VTProps | InvalidProps> {
	const videoObject = ingestPart.pieces.find((p): p is VideoObject => p.objectType === ObjectType.Video)
	if (!videoObject) {
		return createInvalidProps(t('No video object'), ingestPart)
	}

	const clipProps = parseClipEditorProps(videoObject)
	if (!clipProps) {
		return createInvalidProps(t('Could not parse clip properties'), ingestPart)
	}

	return {
		type: PartType.VT,
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
