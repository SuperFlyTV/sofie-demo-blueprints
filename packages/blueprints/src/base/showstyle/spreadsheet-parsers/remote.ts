import { ObjectType, RemoteObject, SomeObject } from '../../../common/definitions/objects.js'
import { t } from '../../../common/util.js'
import { SpreadsheetIngestPart } from '../../../code-copy/spreadsheet-gateway/index.js'
import { SourceType } from '../../studio/helpers/config.js'
import { InvalidProps, PartInfo, PartProps, PartType, RemoteProps } from '../definitions/index.js'
import { findSource } from '../helpers/sources.js'
import { parseBaseProps } from './base.js'
import { createInvalidProps } from './invalid.js'

export function parseRemote(ingestPart: SpreadsheetIngestPart): PartProps<RemoteProps | InvalidProps> {
	const remotePiece = ingestPart.pieces.find(
		(p): p is RemoteObject => (p.objectType as ObjectType) === ObjectType.Remote
	)
	if (!remotePiece) {
		return createInvalidProps(t('No remote input object'), ingestPart)
	}

	const input = findSource(remotePiece.attributes.source, SourceType.Remote)
	if (!input) {
		return createInvalidProps(t(`Could not find remote source for input ${remotePiece.attributes.source}`), ingestPart)
	}

	return {
		type: PartType.Remote,
		rawType: ingestPart.type,
		rawTitle: ingestPart.name,
		info: PartInfo.NORMAL,
		objects: ingestPart.pieces as SomeObject[],
		payload: {
			...parseBaseProps(ingestPart),

			input,
		},
	}
}
