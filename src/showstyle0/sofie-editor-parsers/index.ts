import { IngestSegment, IRundownUserContext } from '@sofie-automation/blueprints-integration'
import { ObjectType } from '../../common/definitions/objects'
import { t } from '../../common/util'
import { EditorIngestPart, EditorIngestSegment } from '../../copy/rundown-editor'
import { AllProps, PartProps, SegmentProps, SegmentType } from '../definitions'
import { createInvalidProps } from '../spreadsheet-parsers/invalid'
import { parseCamera } from './camera'
import { parseDVE } from './dve'
import { parseGfx } from './gfx'
import { parseRemote } from './remote'
import { parseOpener } from './titles'
import { parseVO } from './vo'
import { parseVT } from './vt'

/**
 * This function converts from raw ingest segments to parsed segments
 * @param context
 * @param ingestSegment The segment from the spreadsheet-gateway
 * @returns Intermediate data type used to generate parts
 */
export function convertIngestData(context: IRundownUserContext, ingestSegment: IngestSegment): SegmentProps {
	const parts: PartProps<AllProps>[] = []
	let type = SegmentType.NORMAL

	if (ingestSegment.payload) {
		const payload: EditorIngestSegment = ingestSegment.payload

		if (payload.name.match(/intro/i)) type = SegmentType.OPENING

		ingestSegment.parts.forEach((part) => {
			const partPayload: EditorIngestPart = part.payload

			if (partPayload.type?.match(/cam/i)) {
				parts.push(parseCamera(partPayload))
			} else if (partPayload.type?.match(/dve/i)) {
				parts.push(parseDVE(partPayload))
			} else if (partPayload.type?.match(/gfx/i)) {
				parts.push(parseGfx(partPayload))
			} else if (partPayload.type?.match(/remote/i)) {
				parts.push(parseRemote(partPayload))
			} else if (partPayload.type?.match(/titles/i)) {
				parts.push(parseOpener(partPayload))
			} else if (partPayload.type?.match(/vo/i)) {
				parts.push(parseVO(partPayload))
			} else if (partPayload.type?.match(/vt|full|package/i)) {
				parts.push(parseVT(partPayload))
			} else {
				parts.push(createInvalidProps(t('Unknown part type'), partPayload))
			}
		})
	} else {
		context.logError('Missing segment payload')
	}

	// process the pieces
	parts.forEach((part) => {
		part.objects.forEach((piece) => {
			if (piece.objectType === ObjectType.Graphic) {
				piece.clipName = (piece.attributes as any).template
			} else if (piece.objectType === ObjectType.Video) {
				piece.clipName = piece.attributes.fileName as string
			}
			piece.duration = piece.duration * 1000
			piece.objectTime = piece.objectTime * 1000
		})
	})

	return {
		parts,
		type,
		payload: {
			name: ingestSegment.name,
		},
	}
}
