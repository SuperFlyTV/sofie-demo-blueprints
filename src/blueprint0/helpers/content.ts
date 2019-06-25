import _ = require('underscore')
import { SegmentConf, Piece } from '../../types/classes'
import { CameraContent, VTContent, GraphicsContent, RemoteContent } from 'tv-automation-sofie-blueprints-integration'
import { GetInputValue, Attributes } from './sources'
import { TSRTimelineObj } from 'timeline-state-resolver-types'
import { getStudioName } from './studio'

/**
 * Creates a base camera content.
 */
export function CreateContentCam (config: SegmentConf, piece: Piece): CameraContent {
	let content: CameraContent = {
		studioLabel: getStudioName(config.context),
		switcherInput: GetInputValue(config.context, config.sourceConfig, piece.attributes[Attributes.CAMERA]),
		timelineObjects: _.compact<TSRTimelineObj>([])
	}

	return content
}
/**
 * Creates a base VT content.
 * @param piece Piece used to create content.
 */
export function CreateContentVT (piece: Piece): VTContent {
	let content: VTContent = {
		fileName: piece.clipName,
		path: piece.clipName,
		firstWords: '',
		lastWords: '',
		sourceDuration: piece.duration ? piece.duration : 0,
		timelineObjects: _.compact<TSRTimelineObj>([])
	}

	return content
}

/**
 * Creates a base graphics content.
 * @param piece Piece used to create content.
 */
export function CreateContentGraphics (piece: Piece): GraphicsContent {
	let content: GraphicsContent = {
		fileName: piece.clipName,
		path: piece.clipName,
		timelineObjects: _.compact<TSRTimelineObj>([])
	}

	return content
}

/**
 * Creates a base remote content.
 * @param config Segment config.
 * @param piece Piece used to create content.
 */
export function CreateContentRemote (config: SegmentConf, piece: Piece): RemoteContent {
	let content: RemoteContent = {
		studioLabel: getStudioName(config.context),
		switcherInput: GetInputValue(config.context, config.sourceConfig, piece.attributes[Attributes.REMOTE]),
		timelineObjects: _.compact<TSRTimelineObj>([])
	}

	return content
}
