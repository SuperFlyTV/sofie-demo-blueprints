import { AtemSourceType } from "../../studio0/helpers/config";
import { CameraObject, ObjectType, SomeObject } from "../../common/definitions/objects";
import { SpreadsheetIngestPart } from "../../copy/spreadsheet-gateway"
import { CameraProps, InvalidProps, PartInfo, PartProps, PartType } from "../definitions";
import { findSource } from "../helpers/sources";
import { parseBaseProps } from "./base";
import { createInvalidProps } from "./invalid";
import { t } from "../../common/util";

export function parseCamera(ingestPart: SpreadsheetIngestPart): PartProps<CameraProps | InvalidProps> {
    const cameraPiece = ingestPart.pieces.find((p): p is CameraObject => p.objectType === ObjectType.Camera)
    if (!cameraPiece) {
        return createInvalidProps(t('No camera object'), ingestPart)
    }

    const input = findSource(cameraPiece.attributes.name, AtemSourceType.Camera)
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

            input
        }
    }
}
