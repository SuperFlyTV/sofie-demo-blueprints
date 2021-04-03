import { ObjectType, SomeObject, VideoObject } from "../../common/definitions/objects";
import { SpreadsheetIngestPart } from "../../copy/spreadsheet-gateway"
import { InvalidProps, PartInfo, PartProps, PartType, VOProps } from "../definitions";
import { parseBaseProps } from "./base";
import { createInvalidProps } from "./invalid";
import { t } from "../../common/util";
import { parseClipProps } from "../helpers/clips";

export function parseVO(ingestPart: SpreadsheetIngestPart): PartProps<VOProps | InvalidProps> {
    const videoObject = ingestPart.pieces.find((p): p is VideoObject => p.objectType === ObjectType.Video)
    if (!videoObject) {
        return createInvalidProps(t('No video object'), ingestPart)
    }

    const clipProps = parseClipProps(videoObject)

    return {
        type: PartType.VO,
        rawType: ingestPart.type,
        rawTitle: ingestPart.name,
        info: PartInfo.NORMAL,
        objects: ingestPart.pieces as SomeObject[],
        payload: {
            ...parseBaseProps(ingestPart),

            clipProps
        }
    }
}
