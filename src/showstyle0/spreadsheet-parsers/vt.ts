import { ObjectType, SomeObject, VideoObject } from '../../common/definitions/objects'
import { t } from '../../common/util'
import { SpreadsheetIngestPart } from '../../copy/spreadsheet-gateway'
import { InvalidProps, PartInfo, PartProps, PartType, VTProps } from '../definitions'
import { parseClipProps } from '../helpers/clips'
import { parseBaseProps } from './base'
import { createInvalidProps } from './invalid'

export function parseVT(ingestPart: SpreadsheetIngestPart): PartProps<VTProps | InvalidProps> {
	const videoObject = ingestPart.pieces.find((p): p is VideoObject => p.objectType === ObjectType.Video)
	if (!videoObject) {
		return createInvalidProps(t('No video object'), ingestPart)
	}

	const clipProps = parseClipProps(videoObject)

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
