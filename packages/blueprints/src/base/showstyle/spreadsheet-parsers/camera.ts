import { CameraObject, ObjectType, SomeObject } from '../../../common/definitions/objects.js'
import { t } from '../../../common/util.js'
import { SpreadsheetIngestPart } from '../../../code-copy/spreadsheet-gateway/index.js'
import { SourceType } from '../../studio/helpers/config.js'
import { CameraProps, InvalidProps, PartInfo, PartProps, PartType } from '../definitions/index.js'
import { findSource } from '../helpers/sources.js'
import { parseBaseProps } from './base.js'
import { createInvalidProps } from './invalid.js'

export function parseCamera(ingestPart: SpreadsheetIngestPart): PartProps<CameraProps | InvalidProps> {
	const cameraPiece = ingestPart.pieces.find(
		(p): p is CameraObject => (p.objectType as ObjectType) === ObjectType.Camera
	)
	if (!cameraPiece) {
		return createInvalidProps(t('No camera object'), ingestPart)
	}

	const input = findSource(cameraPiece.attributes.name, SourceType.Camera)
	if (!input) {
		return createInvalidProps(t(`Could not find camera for input ${cameraPiece.attributes.name}`), ingestPart)
	}

	return {
		type: PartType.Camera,
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
