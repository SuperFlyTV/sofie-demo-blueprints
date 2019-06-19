import _ = require('underscore')
import { SegmentConf, Piece } from '../../types/classes'
import { CameraContent, VTContent, GraphicsContent } from 'tv-automation-sofie-blueprints-integration'
import { getInputValue } from './sources'
import { TSRTimelineObj } from 'timeline-state-resolver-types'
import { getStudioName } from './studio'

/**
 * Creates a base camera content.
 */
export function createContentCam (config: SegmentConf, piece: Piece): CameraContent {
	let content: CameraContent = {
		studioLabel: getStudioName(config.context),
		switcherInput: getInputValue(config.context, config.sourceConfig, piece.attributes['name']),
		timelineObjects: _.compact<TSRTimelineObj>([])
	}

	return content
}
/**
 * Creates a base VT content.
 * @param piece Piece used to create content.
 */
export function createContentVT (piece: Piece): VTContent {
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
export function createContentGraphics (piece: Piece): GraphicsContent {
	let content: GraphicsContent = {
		fileName: piece.clipName,
		path: piece.clipName,
		timelineObjects: _.compact<TSRTimelineObj>([])
	}

	return content
}
