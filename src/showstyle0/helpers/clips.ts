import { VideoObject } from '../../common/definitions/objects'
import { AtemSourceType, StudioConfig } from '../../studio0/helpers/config'

export interface ClipProps {
	fileName: string
	duration?: number
}

export function parseClipProps(object: VideoObject): ClipProps {
	return {
		fileName: object.clipName,
		duration: object.duration,
	}
}

export function getClipPlayerInput(config: StudioConfig): StudioConfig['atemSources'][any] | undefined {
	const mediaplayerInput = config.atemSources.find((s) => s.type === AtemSourceType.MediaPlayer)

	return mediaplayerInput
}
