import { SpreadsheetIngestPart } from '../../../code-copy/spreadsheet-gateway'
import { PartBaseProps } from '../definitions'

export function parseBaseProps(part: SpreadsheetIngestPart): PartBaseProps {
	const piecesScript = part.pieces
		.map((p) => p.script)
		.filter((s) => s !== undefined)
		.join('\n')
	const script = part.script + (piecesScript !== '' ? '\n' + piecesScript : '')

	return {
		externalId: part.externalId,
		duration: part.pieces.find((p) => p.attributes.adlib === 'false')?.duration || 0, // TODO - better default time?
		name: part.name,
		script,
	}
}
