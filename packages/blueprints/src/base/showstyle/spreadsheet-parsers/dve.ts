import { ObjectType, SomeObject, SplitObject, VideoObject } from '../../../common/definitions/objects.js'
import { SpreadsheetIngestPart } from '../../../code-copy/spreadsheet-gateway/index.js'
import { SourceType } from '../../studio/helpers/config.js'
import { DVEProps, InvalidProps, PartInfo, PartProps, PartType } from '../definitions/index.js'
import { parseClipProps } from '../helpers/clips.js'
import { findSource } from '../helpers/sources.js'
import { parseBaseProps } from './base.js'

export function parseDVE(ingestPart: SpreadsheetIngestPart): PartProps<DVEProps | InvalidProps> {
	// TODO - parse layout property
	const splitPiece = ingestPart.pieces.find((piece): piece is SplitObject => piece.objectType === 'split')
	const splitInputs: DVEProps['inputs'] = []
	let hasVideo = false // only 1 player means only 1 input can be video

	ingestPart.pieces.forEach((p) => {
		if ((p.objectType as ObjectType) === ObjectType.Camera) {
			const source = findSource(p.attributes.name, SourceType.Camera)
			if (source) splitInputs.push(source)
		} else if ((p.objectType as ObjectType) === ObjectType.Remote) {
			const source = findSource(p.attributes.source, SourceType.Remote)
			if (source) splitInputs.push(source)
		} else if ((p.objectType as ObjectType) === ObjectType.Video && !hasVideo) {
			hasVideo = true
			const clipProps = parseClipProps(p as VideoObject)
			splitInputs.push(clipProps)
		}
	})

	return {
		type: PartType.DVE,
		rawType: ingestPart.type,
		rawTitle: ingestPart.name,
		info: PartInfo.NORMAL,
		objects: ingestPart.pieces as SomeObject[],
		payload: {
			...parseBaseProps(ingestPart),

			layout: splitPiece?.attributes.layout || '',
			inputs: splitInputs.slice(0, 2), // TODO - three box?
		},
	}
}
