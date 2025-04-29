import { IngestSegment, IRundownUserContext } from '@sofie-automation/blueprints-integration'
import { t } from '../../../common/util.js'
import { SpreadsheetIngestPart, SpreadsheetIngestSegment } from '../../../code-copy/spreadsheet-gateway/index.js'
import { AllProps, PartProps, SegmentProps, SegmentType } from '../definitions/index.js'
import { parseCamera } from './camera.js'
import { parseDVE } from './dve.js'
import { parseGfx } from './gfx.js'
import { createInvalidProps } from './invalid.js'
import { parseRemote } from './remote.js'
import { parseOpener } from './titles.js'
import { parseVO } from './vo.js'
import { parseVT } from './vt.js'
import { BaseObject } from '../../../common/definitions/objects.js'

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
		const payload = ingestSegment.payload as SpreadsheetIngestSegment

		if (payload.name.match(/intro/i)) type = SegmentType.OPENING

		ingestSegment.parts.forEach((part) => {
			const partPayload = part.payload as SpreadsheetIngestPart

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
		p.objects.forEach((obj: BaseObject) => {
			obj.isAdlib = obj.attributes.adlib === 'true'
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
