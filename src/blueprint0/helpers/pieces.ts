import _ = require('underscore')
import { Piece, PieceParams } from '../../types/classes'
import {
	IBlueprintAdLibPiece, IBlueprintPiece, PieceEnable, PieceLifespan, TransitionContent, CameraContent, VTContent, GraphicsContent, ScriptContent, MicContent
} from 'tv-automation-sofie-blueprints-integration'
import { literal } from '../../common/util'
import { SourceLayer, AtemLLayer, CasparLLayer, LawoLLayer } from '../../types/layers'
import {
	AtemTransitionStyle, TSRTimelineObj, TimelineObjAtemME, DeviceType, TimelineContentTypeAtem, TimelineObjCCGMedia, TimelineContentTypeCasparCg, TimelineObjLawoSource, TimelineContentTypeLawo
} from 'timeline-state-resolver-types'
import { CreateContentCam, CreateContentVT, CreateContentGraphics } from './content'
import { GetInputValue } from './sources'
import { CreateEnableForTimelineObject } from './timeline'

/**
 * Creates a generic adLib piece.
 * @param {Piece} piece Piece properties.
 */
export function CreatePieceGenericAdLib (piece: Piece): IBlueprintAdLibPiece {
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
export function CreatePieceGenericEnable (piece: Piece): IBlueprintPiece {
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
export function CreatePieceGeneric (piece: Piece): IBlueprintAdLibPiece | IBlueprintPiece {
	let p: IBlueprintPiece | IBlueprintAdLibPiece

	if ('adlib' in piece.attributes && piece.attributes['adlib'] === 'true') {
		p = CreatePieceGenericAdLib(piece)
	} else {
		p = CreatePieceGenericEnable(piece)
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
export function CreatePieceInTransition (piece: Piece, transition: AtemTransitionStyle, duration: number): IBlueprintPiece {
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
export function CreatePieceOutTransition (piece: Piece, transition: AtemTransitionStyle, duration: number): IBlueprintPiece {
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
 * @param {PieceParams} params Piece to create.
 */
export function CreatePieceCam (params: PieceParams, transition: AtemTransitionStyle): IBlueprintAdLibPiece | IBlueprintPiece {
	let p = CreatePieceGeneric(params.piece)

	p.sourceLayerId = SourceLayer.PgmCam
	p.name = params.piece.attributes['name']
	let content: CameraContent = CreateContentCam(params.config, params.piece)

	switch (params.context) {
		default:
			content.timelineObjects = _.compact<TSRTimelineObj>([
				literal<TimelineObjAtemME>({
					id: '',
					enable: CreateEnableForTimelineObject(params.piece),
					priority: 1,
					layer: AtemLLayer.AtemMEProgram,
					content: {
						deviceType: DeviceType.ATEM,
						type: TimelineContentTypeAtem.ME,
						me: {
							input: GetInputValue(params.config.context, params.config.sourceConfig, params.piece.attributes['name']),
							transition: transition
						}
					}
				}),

				literal<TimelineObjLawoSource>({
					id: '',
					enable: { start: 0 },
					priority: 1,
					layer: LawoLLayer.LawoSourceAutomix,
					content: {
						deviceType: DeviceType.LAWO,
						type: TimelineContentTypeLawo.SOURCE,
						'Fader/Motor dB Value': {
							value: 0,
							transitionDuration: 1
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
 * @param {PieceParams} params Piece to create.
 */
export function CreatePieceVideo (params: PieceParams, transition: AtemTransitionStyle): IBlueprintAdLibPiece | IBlueprintPiece {
	let p = CreatePieceGeneric(params.piece)

	p.sourceLayerId = SourceLayer.PgmClip

	let content: VTContent = CreateContentVT(params.piece)

	switch (params.context) {
		default:
			content.timelineObjects = _.compact<TSRTimelineObj>([
				literal<TimelineObjCCGMedia>({
					id: '',
					enable: CreateEnableForTimelineObject(params.piece),
					priority: 1,
					layer: CasparLLayer.CasparPlayerClip,
					content: {
						deviceType: DeviceType.CASPARCG,
						type: TimelineContentTypeCasparCg.MEDIA,
						file: params.piece.clipName
					}
				})
			])
			break
	}

	// TODO: if it should be placed on a screen, it should probably go out over an aux.
	if (!checkAndPlaceOnScreen(p, params.piece.attributes)) {
		content.timelineObjects.push(
			literal<TimelineObjAtemME>({
				id: '',
				enable: CreateEnableForTimelineObject(params.piece),
				priority: 1,
				layer: AtemLLayer.AtemMEProgram,
				content: {
					deviceType: DeviceType.ATEM,
					type: TimelineContentTypeAtem.ME,
					me: {
						input: params.config.config.studio.AtemSource.Server1,
						transition: transition
					}
				}
			})
		)
		content.timelineObjects.push(
			literal<TimelineObjLawoSource>({
				id: '',
				enable: { start: 0 },
				priority: 1,
				layer: LawoLLayer.LawoSourceAutomix,
				content: {
					deviceType: DeviceType.LAWO,
					type: TimelineContentTypeLawo.SOURCE,
					'Fader/Motor dB Value': {
						value: 0,
						transitionDuration: 500
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
 * @param {PieceParams} params Piece to create.
 */
export function CreatePieceGraphic (params: PieceParams, transition: AtemTransitionStyle): IBlueprintAdLibPiece | IBlueprintPiece {
	let p = CreatePieceGeneric(params.piece)

	p.sourceLayerId = SourceLayer.PgmGraphicsSuper

	let content: GraphicsContent = CreateContentGraphics(params.piece)

	switch (params.context) {
		case 'HEAD':
			content.timelineObjects = _.compact<TSRTimelineObj>([
				literal<TimelineObjCCGMedia>({
					id: '',
					enable: CreateEnableForTimelineObject(params.piece),
					priority: 1,
					layer: CasparLLayer.CasparCGGraphics,
					content: {
						deviceType: DeviceType.CASPARCG,
						type: TimelineContentTypeCasparCg.MEDIA,
						file: params.piece.clipName
					}
				})
			])

			if (checkAndPlaceOnScreen(p, params.piece.attributes)) {
				content.timelineObjects.push(
					literal<TimelineObjAtemME>({
						id: '',
						enable: CreateEnableForTimelineObject(params.piece),
						priority: 1,
						layer: AtemLLayer.AtemMEProgram, // TODO: Should be aux?
						content: {
							deviceType: DeviceType.ATEM,
							type: TimelineContentTypeAtem.ME,
							me: {
								input: params.config.config.studio.AtemSource.Server1,
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
						enable: CreateEnableForTimelineObject(params.piece),
						priority: 1,
						layer: AtemLLayer.AtemMEProgram,
						content: {
							deviceType: DeviceType.ATEM,
							type: TimelineContentTypeAtem.ME,
							me: {
								input: params.config.config.studio.AtemSource.Server1,
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
					enable: CreateEnableForTimelineObject(params.piece),
					priority: 1,
					layer: CasparLLayer.CasparCGGraphics,
					content: {
						deviceType: DeviceType.CASPARCG,
						type: TimelineContentTypeCasparCg.MEDIA,
						file: params.piece.clipName
					}
				})
			])

			if (!checkAndPlaceOnScreen(p, params.piece.attributes)) {
				content.timelineObjects.push(
					literal<TimelineObjAtemME>({
						id: '',
						enable: CreateEnableForTimelineObject(params.piece),
						priority: 1,
						layer: AtemLLayer.AtemMEProgram,
						content: {
							deviceType: DeviceType.ATEM,
							type: TimelineContentTypeAtem.ME,
							me: {
								input: params.config.config.studio.AtemSource.Server1,
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
 * @param {PieceParams} params Piece to create.
 */
export function CreatePieceGraphicOverlay (params: PieceParams, transition: AtemTransitionStyle): IBlueprintAdLibPiece | IBlueprintPiece {
	let p = CreatePieceGeneric(params.piece)

	p.sourceLayerId = SourceLayer.PgmGraphicsSuper

	let content: GraphicsContent = CreateContentGraphics(params.piece)

	content.timelineObjects = _.compact<TSRTimelineObj>([
		literal<TimelineObjCCGMedia>({
			id: '',
			enable: CreateEnableForTimelineObject(params.piece),
			priority: 1,
			layer: CasparLLayer.CasparCGGraphics,
			content: {
				deviceType: DeviceType.CASPARCG,
				type: TimelineContentTypeCasparCg.MEDIA,
				file: params.piece.clipName,
				mixer: {
					keyer: true
				}
			}
		}),

		literal<TimelineObjAtemME>({
			id: '',
			enable: CreateEnableForTimelineObject(params.piece),
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

	return p
}

/**
 * Creates a script piece.
 * @param {PieceParams} params Piece to create.
 */
export function CreatePieceScript (params: PieceParams): IBlueprintPiece {
	let p = CreatePieceGenericEnable(params.piece)

	p.sourceLayerId = SourceLayer.PgmScript
	let scriptWords: string[] = []
	if (params.piece.script) {
		scriptWords = params.piece.script.replace('\n', ' ').split(' ')
	}

	let duration = 3000
	if (p.enable.duration) {
		duration = Number(p.enable.duration)

		if (isNaN(duration)) {
			duration = 3000
		}
	}

	let firstWords = scriptWords.slice(0, Math.min(4, scriptWords.length)).join(' ')
	let lastWords = scriptWords.slice(scriptWords.length - (Math.min(4, scriptWords.length)), (Math.min(4, scriptWords.length))).join(' ')

	p.name = (firstWords ? firstWords + '\u2026' : '') + '||' + (lastWords ? '\u2026' + lastWords : '')

	let content: ScriptContent = {
		firstWords: firstWords,
		lastWords: lastWords,
		fullScript: params.piece.script || '',
		sourceDuration: duration,
		lastModified: Date.now() // TODO: pull from gateway
	}

	p.content = content

	return p
}

/**
 * Creates a voiceover piece.
 * @param {PieceParams} params Piece to create.
 */
export function CreatePieceVoiceover (params: PieceParams): IBlueprintPiece {
	let p = CreatePieceGenericEnable(params.piece)

	p.sourceLayerId = SourceLayer.PgmScript

	let scriptWords: string[] = []
	if (params.piece.script) {
		scriptWords = params.piece.script.replace('\n', ' ').split(' ')
	}

	let firstWords = scriptWords.slice(0, Math.min(4, scriptWords.length)).join(' ')
	let lastWords = scriptWords.slice(scriptWords.length - (Math.min(4, scriptWords.length)), (Math.min(4, scriptWords.length))).join(' ')

	p.name = (firstWords ? firstWords + '\u2026' : '') + '||' + (lastWords ? '\u2026' + lastWords : '')

	let duration = 3000
	if (p.enable.duration) {
		duration = Number(p.enable.duration)

		if (isNaN(duration)) {
			duration = 3000
		}
	}

	let content: MicContent = {
		firstWords: firstWords,
		lastWords: lastWords,
		fullScript: params.piece.script,
		sourceDuration: duration,
		mixConfiguration: {},
		timelineObjects: _.compact<TSRTimelineObj>([
			literal<TimelineObjLawoSource>({
				id: '',
				enable: { start: 0 },
				priority: 1,
				layer: LawoLLayer.LawoSourceAutomix,
				content: {
					deviceType: DeviceType.LAWO,
					type: TimelineContentTypeLawo.SOURCE,
					'Fader/Motor dB Value': {
						value: 0,
						transitionDuration: 1
					}
				}
			})
		])
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
