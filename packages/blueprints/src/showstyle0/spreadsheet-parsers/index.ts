import { IngestSegment, IRundownUserContext } from '@sofie-automation/blueprints-integration'
import { t } from '../../common/util'
import { SpreadsheetIngestPart, SpreadsheetIngestSegment } from '../../copy/spreadsheet-gateway'
import { AllProps, PartProps, SegmentProps, SegmentType } from '../definitions'
import { parseCamera } from './camera'
import { parseDVE } from './dve'
import { parseGfx } from './gfx'
import { createInvalidProps } from './invalid'
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
		const payload: SpreadsheetIngestSegment = ingestSegment.payload

		if (payload.name.match(/intro/i)) type = SegmentType.OPENING

		ingestSegment.parts.forEach((part) => {
			const partPayload: SpreadsheetIngestPart = part.payload

			if (partPayload.type.match(/cam/i)) {
				parts.push(parseCamera(partPayload))
			} else if (partPayload.type.match(/remote/i)) {
				parts.push(parseRemote(partPayload))
			} else if (partPayload.type.match(/(full|vt|package)/i)) {
				parts.push(parseVT(partPayload))
			} else if (partPayload.type.match(/vo/i)) {
				parts.push(parseVO(partPayload))
			} else if (partPayload.type.match(/titles/i)) {
				parts.push(parseOpener(partPayload))
			} else if (partPayload.type.match(/dve/i)) {
				parts.push(parseDVE(partPayload))
			} else if (partPayload.type.match(/gfx/i)) {
				parts.push(parseGfx(partPayload))
			} else {
				parts.push(createInvalidProps(t('Unknown part type'), partPayload))
			}
		})
	} else {
		context.logError('Missing segment payload')
	}

	// parse the objects
	parts.forEach((p) => {
		p.objects.forEach((obj) => {
			obj.isAdlib = (obj.attributes as any).adlib === 'true'
		})
	})

	return {
		type,
		parts,
		payload: {
			name: ingestSegment.name,
		},
	}
}
