import { ObjectType, SomeObject, SplitObject, VideoObject } from '../../../common/definitions/objects'
import { EditorIngestPart } from '../../../code-copy/rundown-editor'
import { SourceType } from '../../studio/helpers/config'
import { DVEProps, InvalidProps, PartInfo, PartProps, PartType } from '../definitions'
import { parseClipEditorProps } from '../helpers/clips'
import { findSource } from '../helpers/sources'
import { parseBaseProps } from './base'

export function parseDVE(ingestPart: EditorIngestPart): PartProps<DVEProps | InvalidProps> {
	// TODO - parse layout property
	const splitPiece = ingestPart.pieces.find((piece): piece is SplitObject => piece.objectType === 'split')
	const splitInputs: DVEProps['inputs'] = []
	let hasVideo = false // only 1 player means only 1 input can be video

	ingestPart.pieces.forEach((p) => {
		if (p.objectType === ObjectType.Camera) {
			const source = findSource(p.attributes.camNo, SourceType.Camera)
			if (source) splitInputs.push(source)
		} else if (p.objectType === ObjectType.Remote) {
			const source = findSource(p.attributes.input, SourceType.Remote)
			if (source) splitInputs.push(source)
		} else if (p.objectType === ObjectType.Video && !hasVideo) {
			hasVideo = true
			const clipProps = parseClipEditorProps(p as VideoObject)
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
