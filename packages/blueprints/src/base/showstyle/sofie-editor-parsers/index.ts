import { IngestSegment, IRundownUserContext } from '@sofie-automation/blueprints-integration'
import { ObjectType } from '../../../common/definitions/objects'
import { t } from '../../../common/util'
import { EditorIngestPart, EditorIngestSegment } from '../../../code-copy/rundown-editor'
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
 * This function converts from raw ingest segments to parsed segments, we
 * make sure to parse to the data structure originally used by the
 * spreadsheets.
 * @param context
 * @param ingestSegment The segment from the spreadsheet-gateway
 * @returns Intermediate data type used to generate parts
 */
export function convertIngestData(context: IRundownUserContext, ingestSegment: IngestSegment): SegmentProps {
	const parts: PartProps<AllProps>[] = []
	let type = SegmentType.NORMAL

	if (ingestSegment.payload) {
		const payload = ingestSegment.payload as EditorIngestSegment

		if (payload.name.match(/intro/i)) type = SegmentType.OPENING

		ingestSegment.parts.forEach((part) => {
			const partPayload = part.payload as EditorIngestPart

			// process the pieces
			const graphicTypes = ['strap', 'head', 'l3d', 'fullscreen']
			partPayload.pieces.forEach((piece) => {
				if (piece.objectType === ObjectType.Graphic) {
					piece.clipName = (piece.attributes as any).template || ''

					if (piece.clipName === 'gfx/strap') {
						piece.attributes.location = (piece.attributes as any).field0
						piece.attributes.text = (piece.attributes as any).field1
					} else if (piece.clipName === 'gfx/head') {
						piece.attributes.text = (piece.attributes as any).field0
					} else if (piece.clipName === 'gfx/l3d') {
						piece.attributes.name = (piece.attributes as any).field0
						piece.attributes.description = (piece.attributes as any).field1
					} else if (piece.clipName === 'gfx/fullscreen') {
						;(piece.attributes as any).url = (piece.attributes as any).field0
					}
				} else if (piece.objectType === ObjectType.Video) {
					piece.clipName = piece.attributes.fileName as string
				}

				piece.duration = piece.duration * 1000
				piece.objectTime = piece.objectTime * 1000

				if (graphicTypes.includes(piece.objectType)) {
					piece.clipName = 'gfx/' + piece.objectType
					piece.objectType = ObjectType.Graphic
				}
			})

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
			if (!piece.objectTime && piece.objectTime !== 0) {
				piece.isAdlib = true
			}
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
