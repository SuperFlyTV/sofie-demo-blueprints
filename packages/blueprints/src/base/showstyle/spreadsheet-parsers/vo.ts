import { ObjectType, SomeObject, VideoObject } from '../../../common/definitions/objects.js'
import { t } from '../../../common/util.js'
import { SpreadsheetIngestPart } from '../../../code-copy/spreadsheet-gateway/index.js'
import { InvalidProps, PartInfo, PartProps, PartType, VOProps } from '../definitions/index.js'
import { parseClipProps } from '../helpers/clips.js'
import { parseBaseProps } from './base.js'
import { createInvalidProps } from './invalid.js'

export function parseVO(ingestPart: SpreadsheetIngestPart): PartProps<VOProps | InvalidProps> {
	const videoObject = ingestPart.pieces.find((p): p is VideoObject => (p.objectType as ObjectType) === ObjectType.Video)
	if (!videoObject) {
		return createInvalidProps(t('No video object'), ingestPart)
	}

	const clipProps = parseClipProps(videoObject)

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
