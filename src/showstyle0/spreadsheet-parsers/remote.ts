import { AtemSourceType } from "../../studio0/helpers/config";
import { ObjectType, RemoteObject, SomeObject } from "../../common/definitions/objects";
import { SpreadsheetIngestPart } from "../../copy/spreadsheet-gateway"
import { InvalidProps, PartInfo, PartProps, PartType, RemoteProps } from "../definitions";
import { findSource } from "../helpers/sources";
import { parseBaseProps } from "./base";
import { createInvalidProps } from "./invalid";
import { t } from "../../common/util";

export function parseRemote(ingestPart: SpreadsheetIngestPart): PartProps<RemoteProps | InvalidProps> {
    const remotePiece = ingestPart.pieces.find((p): p is RemoteObject => p.objectType === ObjectType.Remote)
    if (!remotePiece) {
        return createInvalidProps(t('No remote input object'), ingestPart)
    }

    const input = findSource(remotePiece.attributes.source, AtemSourceType.Remote)
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

            input
        }
    }
}
