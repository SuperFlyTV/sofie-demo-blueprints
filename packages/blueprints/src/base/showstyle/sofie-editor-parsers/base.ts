import { EditorIngestPart } from '../../../code-copy/rundown-editor'
import { PartBaseProps } from '../definitions'

export function parseBaseProps(part: EditorIngestPart): PartBaseProps {
	const script = part.script

	return {
		externalId: part.externalId,
		duration: (part.duration || 0) * 1000,
		name: part.name,
		script,
	}
}
