import { ObjectType, SomeObject, VideoObject } from '../../../common/definitions/objects.js'
import { t } from '../../../common/util.js'
import { SpreadsheetIngestPart } from '../../../code-copy/spreadsheet-gateway/index.js'
import { InvalidProps, PartInfo, PartProps, PartType, VTProps } from '../definitions/index.js'
import { parseClipProps } from '../helpers/clips.js'
import { parseBaseProps } from './base.js'
import { createInvalidProps } from './invalid.js'

export function parseVT(ingestPart: SpreadsheetIngestPart): PartProps<VTProps | InvalidProps> {
	const videoObject = ingestPart.pieces.find((p): p is VideoObject => (p.objectType as ObjectType) === ObjectType.Video)
	if (!videoObject) {
		return createInvalidProps(t('No video object'), ingestPart)
	}

	const clipProps = parseClipProps(videoObject)
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
