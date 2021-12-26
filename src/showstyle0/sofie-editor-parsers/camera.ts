import { ObjectType, SomeObject } from '../../common/definitions/objects'
import { t } from '../../common/util'
import { EditorIngestPart } from '../../copy/rundown-editor'
import { AtemSourceType } from '../../studio0/helpers/config'
import { CameraProps, InvalidProps, PartInfo, PartProps, PartType } from '../definitions'
import { findSource } from '../helpers/sources'
import { parseBaseProps } from './base'
import { createInvalidProps } from './invalid'

export function parseCamera(ingestPart: EditorIngestPart): PartProps<CameraProps | InvalidProps> {
	const cameraPiece = ingestPart.pieces.find((p) => p.objectType === ObjectType.Camera)
	if (!cameraPiece) {
		return createInvalidProps(t('No camera object'), ingestPart)
	}

	const input = findSource(cameraPiece.attributes.camNo, AtemSourceType.Camera)
	if (!input) {
		return createInvalidProps(t(`Could not find camera for input ${cameraPiece.attributes.camNo}`), ingestPart)
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
