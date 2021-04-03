import { BlueprintResultPart, IBlueprintPiece, PieceLifespan, TSR } from "@sofie-automation/blueprints-integration";
import { StudioConfig } from "../../studio0/helpers/config";
import { PartContext } from "../../common/context";
import { getOutputLayerForSourceLayer, SourceLayer } from "../layers";
import { PartProps, VOProps } from "../definitions";
import { literal } from "../../common/util";
import { CasparCGLayers } from "../../studio0/layers";
import { getClipPlayerInput } from "../helpers/clips";
import { createScriptPiece } from "../helpers/script";
import { createAtemInputTimelineObjects } from "../helpers/atem";
import { parseGraphicsFromObjects } from "../helpers/graphics";

export function generateVOPart(context: PartContext, part: PartProps<VOProps>): BlueprintResultPart {
    const config = context.getStudioConfig() as StudioConfig
    const atemInput = getClipPlayerInput(config)

    const cameraPiece: IBlueprintPiece = {
        enable: {
            start: 0,
        },
        externalId: part.payload.externalId,
        name: `${part.payload.clipProps.fileName || 'Missing file name'}`,
        lifespan: PieceLifespan.WithinPart,
        sourceLayerId: SourceLayer.VO,
        outputLayerId: getOutputLayerForSourceLayer(SourceLayer.VO),
        
        content: {
            fileName: part.payload.clipProps.fileName,

            timelineObjects: [
                ...createAtemInputTimelineObjects(atemInput?.input ||0),

                literal<TSR.TimelineObjCCGMedia>({
                    id: '',
                    enable: { start: 0 },
                    layer: CasparCGLayers.CasparCGClipPlayer,
                    content: {
                        deviceType: TSR.DeviceType.CASPARCG,
                        type: TSR.TimelineContentTypeCasparCg.MEDIA,

                        file: part.payload.clipProps.fileName
                    }
                })
            ]
        }
    }
    
    const pieces = [
        cameraPiece
    ]
    const scriptPiece = createScriptPiece(part.payload.script, part.payload.externalId)
    if (scriptPiece) pieces.push(scriptPiece)

    const graphics = parseGraphicsFromObjects(part.objects)
    if (graphics.pieces) pieces.push(...graphics.pieces)

    return {
        part: {
            externalId: part.payload.externalId,
            title: part.payload.name,

            expectedDuration: part.payload.duration,
        },
        pieces,
        adLibPieces: [
            ...graphics.adLibPieces
        ],
    }
}
