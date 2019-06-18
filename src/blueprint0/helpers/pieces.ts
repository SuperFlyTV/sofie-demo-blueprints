import _ = require('underscore')
import { Piece, SegmentConf } from '../../types/classes'
import {
	IBlueprintAdLibPiece, IBlueprintPiece, PieceEnable, PieceLifespan, TransitionContent, CameraContent, VTContent, GraphicsContent, ScriptContent
} from 'tv-automation-sofie-blueprints-integration'
import { literal } from '../../common/util'
import { SourceLayer, AtemLLayer, CasparLLayer } from '../../types/layers'
import {
	AtemTransitionStyle, TSRTimelineObj, TimelineObjAtemME, DeviceType, TimelineContentTypeAtem, TimelineObjCCGMedia, TimelineContentTypeCasparCg
} from 'timeline-state-resolver-types'
import { createContentCam, createContentVT, createContentGraphics } from './content'
import { getInputValue } from './sources'
import { createEnableForTimelineObject } from './timeline'

/**
 * Creates a generic adLib piece.
 * @param {Piece} piece Piece properties.
 */
export function createPieceGenericAdLib (piece: Piece): IBlueprintAdLibPiece {
	let p = literal<IBlueprintAdLibPiece>({
		externalId: piece.id,
		name: piece.clipName,
		outputLayerId: 'pgm0',
		sourceLayerId: SourceLayer.PgmCam,
		metaData: piece.attributes,
		_rank: 0
	})

	if (!piece.duration) {
		p.expectedDuration = piece.duration
	}

	return p
}

/**
 * Creates a generic IBlueprintPiece.
 * @param {Piece} piece Piece properties.
 */
export function createPieceGenericEnable (piece: Piece): IBlueprintPiece {
	let enable: PieceEnable = {}
	enable.start = piece.objectTime || 0

	let p = literal<IBlueprintPiece>({
		_id: '',
		externalId: piece.id,
		name: piece.clipName,
		enable: enable,
		outputLayerId: 'pgm0',
		sourceLayerId: SourceLayer.PgmCam,
		metaData: piece.attributes
	})

	if (piece.duration) {
		enable.duration = piece.duration
		p.enable = enable
	}

	return p
}

/**
 * Creates a generic piece. Will return an Adlib piece if suitable.
 * @param {Piece} piece Piece to evaluate.
 * @returns {IBlueprintPieceGeneric} A possibly infinite, possibly Adlib piece.
 */
export function createPieceGeneric (piece: Piece): IBlueprintAdLibPiece | IBlueprintPiece {
	let p: IBlueprintPiece | IBlueprintAdLibPiece

	if ('adlib' in piece.attributes && piece.attributes['adlib'] === 'true') {
		p = createPieceGenericAdLib(piece)
	} else {
		p = createPieceGenericEnable(piece)
	}

	// TODO: This may become context-specific
	if (!piece.duration) {
		p.infiniteMode = PieceLifespan.OutOnNextPart
	}

	return p
}

/**
 * Creates a transition piece.
 * @param {Piece} piece Piece to generate.
 * @param {AtemTransitionStyle} transition Transition style.
 * @param {number} duration Length of transition.
 */
export function createPieceInTransition (piece: Piece, transition: AtemTransitionStyle, duration: number): IBlueprintPiece {
	let p = literal<IBlueprintPiece>({
		_id: '',
		externalId: 'T' + piece.id,
		name: 'T' + duration,
		enable: {
			start: 0,
			duration: duration
		},
		outputLayerId: 'pgm0',
		sourceLayerId: SourceLayer.PgmTransition,
		isTransition: true,
		content: literal<TransitionContent>({
			timelineObjects: _.compact<TSRTimelineObj>([
				literal<TimelineObjAtemME>({
					id: '',
					enable: {
						start: 0
					},
					priority: 5,
					layer: AtemLLayer.AtemMEProgram,
					content: {
						deviceType: DeviceType.ATEM,
						type: TimelineContentTypeAtem.ME,
						me: {
							input: 1000,
							transition: transition,
							transitionSettings: {
								mix: {
									rate: 0
								}
							}
						}
					}
				})
			])
		})
	})

	return p
}

/**
 * Creates an out transition of given duration.
 * @param {Piece} piece Piece to transition.
 * @param {AtemTransitionStyle} transition Transition type.
 * @param {number} duration Length of transition.
 */
export function createPieceOutTransition (piece: Piece, transition: AtemTransitionStyle, duration: number): IBlueprintPiece {
	let p = literal<IBlueprintPiece>({
		_id: '',
		externalId: 'T' + piece.id,
		name: 'T' + duration,
		enable: {
			start: piece.duration - duration,
			duration: duration
		},
		outputLayerId: 'pgm0',
		sourceLayerId: SourceLayer.PgmTransition,
		isTransition: true,
		content: literal<TransitionContent>({
			timelineObjects: _.compact<TSRTimelineObj>([
				literal<TimelineObjAtemME>({
					id: '',
					enable: {
						start: piece.duration - duration
					},
					priority: 5,
					layer: AtemLLayer.AtemMEProgram,
					content: {
						deviceType: DeviceType.ATEM,
						type: TimelineContentTypeAtem.ME,
						me: {
							input: 1000, // TODO get from Sofie
							transition: transition,
							transitionSettings: {
								mix: {
									rate: 0
								}
							}
						}
					}
				})
			])
		})
	})

	return p
}

/**
 * Creates a cam piece.
 * @param {Piece} piece Piece to evaluate.
 * @param {string} context Context the piece belongs to.
 * @param {AtemTransitionsStyle} transition Type of transition to use.
 */
export function createPieceCam (config: SegmentConf, piece: Piece, context: string, transition: AtemTransitionStyle): IBlueprintAdLibPiece | IBlueprintPiece {
	let p = createPieceGeneric(piece)

	p.sourceLayerId = SourceLayer.PgmCam
	p.name = piece.attributes['attr0'] // TODO: Pull this from attributes?
	let content: CameraContent = createContentCam(config, piece)

	switch (context) {
		default:
			content.timelineObjects = _.compact<TSRTimelineObj>([
				literal<TimelineObjAtemME>({
					id: '',
					enable: createEnableForTimelineObject(piece),
					priority: 1,
					layer: AtemLLayer.AtemMEProgram,
					content: {
						deviceType: DeviceType.ATEM,
						type: TimelineContentTypeAtem.ME,
						me: {
							input: getInputValue(config.context, config.sourceConfig, piece.attributes['attr0']),
							transition: transition
						}
					}
				})
			])
			break
	}

	p.content = content

	return p
}

/**
 * Creates a cam piece.
 * @param {Piece} piece Piece to evaluate.
 * @param {string} context Context the piece belongs to.
 * @param {AtemTransitionsStyle} transition Type of transition to use.
 */
export function createPieceVideo (config: SegmentConf, piece: Piece, context: string, transition: AtemTransitionStyle): IBlueprintAdLibPiece | IBlueprintPiece {
	let p = createPieceGeneric(piece)

	p.sourceLayerId = SourceLayer.PgmClip

	let content: VTContent = createContentVT(piece)

	switch (context) {
		default:
			content.timelineObjects = _.compact<TSRTimelineObj>([
				literal<TimelineObjCCGMedia>({
					id: '',
					enable: createEnableForTimelineObject(piece),
					priority: 1,
					layer: CasparLLayer.CasparPlayerClip,
					content: {
						deviceType: DeviceType.CASPARCG,
						type: TimelineContentTypeCasparCg.MEDIA,
						file: piece.clipName
					}
				})
			])
			break
	}

	// TODO: if it should be placed on a screen, it should probably go out over an aux.
	if (!checkAndPlaceOnScreen(p, piece.attributes)) {
		content.timelineObjects.push(
			literal<TimelineObjAtemME>({
				id: '',
				enable: createEnableForTimelineObject(piece),
				priority: 1,
				layer: AtemLLayer.AtemMEProgram,
				content: {
					deviceType: DeviceType.ATEM,
					type: TimelineContentTypeAtem.ME,
					me: {
						input: config.config.studio.AtemSource.Server1,
						transition: transition
					}
				}
			})
		)
	}

	p.content = content

	return p
}

/**
 * Creates a cam piece.
 * @param {Piece} piece Piece to evaluate.
 * @param {string} context Context the piece belongs to.
 * @param {AtemTransitionsStyle} transition Type of transition to use.
 */
export function createPieceGraphic (config: SegmentConf, piece: Piece, context: string, transition: AtemTransitionStyle): IBlueprintAdLibPiece | IBlueprintPiece {
	let p = createPieceGeneric(piece)

	p.sourceLayerId = SourceLayer.PgmGraphicsSuper

	let content: GraphicsContent = createContentGraphics(piece)

	switch (context) {
		case 'HEAD':
			content.timelineObjects = _.compact<TSRTimelineObj>([
				literal<TimelineObjCCGMedia>({
					id: '',
					enable: createEnableForTimelineObject(piece),
					priority: 1,
					layer: CasparLLayer.CasparCGGraphics,
					content: {
						deviceType: DeviceType.CASPARCG,
						type: TimelineContentTypeCasparCg.MEDIA,
						file: piece.clipName
					}
				})
			])

			if (checkAndPlaceOnScreen(p, piece.attributes)) {
				content.timelineObjects.push(
					literal<TimelineObjAtemME>({
						id: '',
						enable: createEnableForTimelineObject(piece),
						priority: 1,
						layer: AtemLLayer.AtemMEProgram, // TODO: Should be aux?
						content: {
							deviceType: DeviceType.ATEM,
							type: TimelineContentTypeAtem.ME,
							me: {
								input: config.config.studio.AtemSource.Server1,
								transition: transition,
								transitionSettings: {
									mix: {
										rate: 100
									}
								}
							}
						}
					})
				)
			} else {
				content.timelineObjects.push(
					literal<TimelineObjAtemME>({
						id: '',
						enable: createEnableForTimelineObject(piece),
						priority: 1,
						layer: AtemLLayer.AtemMEProgram,
						content: {
							deviceType: DeviceType.ATEM,
							type: TimelineContentTypeAtem.ME,
							me: {
								input: config.config.studio.AtemSource.Server1,
								transition: AtemTransitionStyle.WIPE
							}
						}
					})
				)
			}
			break
		default:
			content.timelineObjects = _.compact<TSRTimelineObj>([
				literal<TimelineObjCCGMedia>({
					id: '',
					enable: createEnableForTimelineObject(piece),
					priority: 1,
					layer: CasparLLayer.CasparCGGraphics,
					content: {
						deviceType: DeviceType.CASPARCG,
						type: TimelineContentTypeCasparCg.MEDIA,
						file: piece.clipName
					}
				})
			])

			if (!checkAndPlaceOnScreen(p, piece.attributes)) {
				content.timelineObjects.push(
					literal<TimelineObjAtemME>({
						id: '',
						enable: createEnableForTimelineObject(piece),
						priority: 1,
						layer: AtemLLayer.AtemMEProgram,
						content: {
							deviceType: DeviceType.ATEM,
							type: TimelineContentTypeAtem.ME,
							me: {
								input: config.config.studio.AtemSource.Server1,
								transition: AtemTransitionStyle.CUT
							}
						}
					})
				)
			}
			break
	}

	p.content = content

	return p
}

/**
 * Creates a graphics overlay.
 * @param {Piece} piece Piece to create.
 * @param {string} context Context the piece belongs to.
 * @param {AtemTransitionsStyle} transition Type of transition to use.
 */
export function createPieceGraphicOverlay (config: SegmentConf, piece: Piece, context: string, transition: AtemTransitionStyle): IBlueprintAdLibPiece | IBlueprintPiece {
	let p = createPieceGeneric(piece)

	p.sourceLayerId = SourceLayer.PgmGraphicsSuper

	let content: GraphicsContent = createContentGraphics(piece)

	content.timelineObjects = _.compact<TSRTimelineObj>([
		literal<TimelineObjCCGMedia>({
			id: '',
			enable: createEnableForTimelineObject(piece),
			priority: 1,
			layer: CasparLLayer.CasparCGGraphics,
			content: {
				deviceType: DeviceType.CASPARCG,
				type: TimelineContentTypeCasparCg.MEDIA,
				file: piece.clipName,
				mixer: {
					keyer: true
				}
			}
		}),

		literal<TimelineObjAtemME>({
			id: '',
			enable: createEnableForTimelineObject(piece),
			priority: 1,
			layer: AtemLLayer.AtemDSKGraphics,
			content: {
				deviceType: DeviceType.ATEM,
				type: TimelineContentTypeAtem.ME,
				me: {
					transition: transition,
					transitionSettings: {
						mix: {
							rate: 100
						}
					},
					upstreamKeyers: [
						{
							upstreamKeyerId: 1000, // TODO: get from Sofie.
							onAir: true,
							fillSource: 1000 // TODO: get from Sofie.
						}
					]
				}
			}
		})
	])

	p.content = content

	console.log(context) // TODO: there has to be a better way.
	console.log(config)

	return p
}

/**
 * Creates a script piece.
 * @param {Piece} piece Parent piece.
 * @param {string} script String containing script.
 */
export function createPieceScript (piece: Piece, script: string): IBlueprintPiece {
	let p = createPieceGenericEnable(piece)

	p.sourceLayerId = SourceLayer.PgmScript
	let scriptWords = script.replace('\n', ' ').split(' ')

	let content: ScriptContent = {
		firstWords: scriptWords.slice(0, Math.min(4, scriptWords.length)).join(' '),
		lastWords: scriptWords.slice(scriptWords.length - (Math.min(4, scriptWords.length)), (Math.min(4, scriptWords.length))).join(' '),
		fullScript: script,
		sourceDuration: Number(p.enable.duration) || 1000
	}

	p.content = content

	return p
}

/**
 * Checks whether a piece should be placed on a screen, if so, it places it on the corresponding screen.
 * @param {IBlueprintPiece} p The Piece blueprint to modify.
 * @param {any} attr Attributes of the piece.
 */
function checkAndPlaceOnScreen (p: IBlueprintPiece | IBlueprintAdLibPiece, attr: any): boolean {
	if ('attr0' in attr) {
		if (attr['attr0'].match(/screen \d/i)) {
			// TODO: this whitespace replacement is due to the current testing environment.
			// 		in future, the 'name' attr should be populated such that it is correct at this point, without string manipulation.
			p.outputLayerId = attr['attr0'].replace(/\s/g, '')
			return true
		}
	}
	return false
}
