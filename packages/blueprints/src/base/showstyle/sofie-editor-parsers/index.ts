import { IRundownUserContext, SofieIngestSegment } from '@sofie-automation/blueprints-integration'
import { ObjectType } from '../../../common/definitions/objects.js'
import { t } from '../../../common/util.js'
import { EditorIngestPart, EditorIngestSegment } from '../../../code-copy/rundown-editor/index.js'
import { AllProps, PartProps, SegmentProps, SegmentType } from '../definitions/index.js'
import { createInvalidProps } from '../spreadsheet-parsers/invalid.js'
import { parseCamera } from './camera.js'
import { parseDVE } from './dve.js'
import { parseGfx } from './gfx.js'
import { parseRemote } from './remote.js'
import { parseOpener } from './titles.js'
import { parseVO } from './vo.js'
import { parseVT } from './vt.js'

/**
 * This function converts from raw ingest segments to parsed segments, we
 * make sure to parse to the data structure originally used by the
 * Editor
 * @param context
 * @param ingestSegment The segment from the rundown editor
 * @returns Intermediate data type used to generate parts
 */
export function convertIngestData(context: IRundownUserContext, ingestSegment: SofieIngestSegment): SegmentProps {
	const parts: PartProps<AllProps>[] = []
	let type = SegmentType.NORMAL // When using Sofie Rundown Editor you can get the segment type from ingestSegment.payload.type

	if (ingestSegment.payload) {
		const payload = ingestSegment.payload as EditorIngestSegment

		if (payload.name.match(/intro/i)) type = SegmentType.OPENING

		ingestSegment.parts.forEach((part) => {
			const partPayload = part.payload as EditorIngestPart
			// When using Sofie Rundown Editor you can get the segment type from partPayload.type

			// convert graphic sub-types into graphic objects. to be parsed in a GFX part.
			const graphicTypes = ['strap', 'head', 'l3d', 'fullscreen', 'stepped-graphic']
			partPayload.pieces.forEach((piece) => {
				if ((piece.objectType as ObjectType) === ObjectType.Graphic) {
					piece.clipName = String(piece.attributes.template || '')

					if (piece.clipName === 'gfx/strap') {
						piece.attributes.location = piece.attributes.field0
						piece.attributes.text = piece.attributes.field1
					} else if (piece.clipName === 'gfx/head') {
						piece.attributes.text = piece.attributes.field0
					} else if (piece.clipName === 'gfx/l3d') {
						piece.attributes.name = piece.attributes.field0
						piece.attributes.description = piece.attributes.field1
					} else if (piece.clipName === 'gfx/fullscreen') {
						piece.attributes.url = piece.attributes.field0
					}
				} else if ((piece.objectType as ObjectType) === ObjectType.Video) {
					piece.clipName = piece.attributes.fileName as string
				}

				piece.duration = piece.duration * 1000
				piece.objectTime = piece.objectTime * 1000

				if (graphicTypes.includes(piece.objectType)) {
					piece.clipName = 'gfx/' + piece.objectType
					piece.objectType = ObjectType.Graphic

					// Pass piece name to template as an attribute if it exists
					if (piece.name) {
						piece.attributes.pieceName = piece.name
					}
				}
			})

			// process the pieces
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
