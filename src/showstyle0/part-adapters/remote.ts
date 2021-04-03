import { BlueprintResultPart, IBlueprintPiece, PieceLifespan } from "@sofie-automation/blueprints-integration";
import { StudioConfig } from "../../studio0/helpers/config";
import { PartContext } from "../../common/context";
import { getSourceInfoFromRaw } from "../helpers/sources";
import { getOutputLayerForSourceLayer, SourceLayer } from "../layers";
import { PartProps, RemoteProps } from "../definitions";
import { createScriptPiece } from "../helpers/script";
import { createAtemInputTimelineObjects } from "../helpers/atem";
import { parseGraphicsFromObjects } from "../helpers/graphics";

export function generateRemotePart(context: PartContext, part: PartProps<RemoteProps>): BlueprintResultPart {
    const config = context.getStudioConfig() as StudioConfig
    const sourceInfo = getSourceInfoFromRaw(config, part.payload.input)

    const cameraPiece: IBlueprintPiece = {
        enable: {
            start: 0,
        },
        externalId: part.payload.externalId,
        name: `Rem ${sourceInfo.id}`,
        lifespan: PieceLifespan.WithinPart,
        sourceLayerId: SourceLayer.Remote,
        outputLayerId: getOutputLayerForSourceLayer(SourceLayer.Remote),
        content: {
            timelineObjects: [
                ...createAtemInputTimelineObjects(sourceInfo.input)
            ]
        }
    }

    const pieces = [
        cameraPiece
    ]
    const scriptPiece = createScriptPiece(part.payload.script, part.payload.externalId)
    if (scriptPiece) pieces.push(scriptPiece)

    context.logDebug('objects ' + JSON.stringify(part.objects.filter(o => o.objectType === 'graphic'), undefined, 4))

    const graphics = parseGraphicsFromObjects(part.objects)
    if (graphics.pieces) pieces.push(...graphics.pieces)

    return {
        part: {
            externalId: part.payload.externalId,
            title: part.payload.name,

            expectedDuration: part.payload.duration
        },
        pieces,
        adLibPieces: [
            ...graphics.adLibPieces
        ],
    }
}
