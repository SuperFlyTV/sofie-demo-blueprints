import { ObjectType, SomeObject, VideoObject } from '../../common/definitions/objects'
import { SpreadsheetIngestPart } from '../../copy/spreadsheet-gateway'
import { AtemSourceType } from '../../studio0/helpers/config'
import { DVEProps, InvalidProps, PartInfo, PartProps, PartType } from '../definitions'
import { parseClipProps } from '../helpers/clips'
import { DVELayouts } from '../helpers/dve'
import { findSource } from '../helpers/sources'
import { parseBaseProps } from './base'

export function parseDVE(ingestPart: SpreadsheetIngestPart): PartProps<DVEProps | InvalidProps> {
	// TODO - parse layout property
	const splitInputs: DVEProps['inputs'] = []
	let hasVideo = false // only 1 player means only 1 input can be video

	ingestPart.pieces.forEach((p) => {
		if (p.objectType === ObjectType.Camera) {
			const source = findSource(p.attributes.name, AtemSourceType.Camera)
			if (source) splitInputs.push(source)
		} else if (p.objectType === ObjectType.Remote) {
			const source = findSource(p.attributes.source, AtemSourceType.Remote)
			if (source) splitInputs.push(source)
		} else if (p.objectType === ObjectType.Video && !hasVideo) {
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

			layout: DVELayouts.TwoBox,
			inputs: splitInputs.slice(0, 2), // TODO - three box?
		},
	}
}
