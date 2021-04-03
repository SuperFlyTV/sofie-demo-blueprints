import { AtemSourceType, StudioConfig } from "../../studio0/helpers/config"
import { VideoObject } from "../../common/definitions/objects"

export interface ClipProps {
    fileName: string
    duration?: number
}

export function parseClipProps (object: VideoObject): ClipProps {
    return {
        fileName: object.clipName,
        duration: object.duration
    }
}

export function getClipPlayerInput (config: StudioConfig) {
    const mediaplayerInput = config.atemSources.find(s => s.type === AtemSourceType.MediaPlayer)

    return mediaplayerInput
}
