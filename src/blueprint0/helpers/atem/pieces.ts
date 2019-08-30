import _ = require('underscore')
import { literal } from '../../../common/util'
import { AtemTransitionStyle, TSRTimelineObj, TimelineObjAtemME, DeviceType, TimelineContentTypeAtem, TimelineObjLawoSource, TimelineContentTypeLawo } from 'timeline-state-resolver-types'
import { Piece, PieceParams } from '../../../types/classes'
import { IBlueprintPiece, TransitionContent, IBlueprintAdLibPiece, CameraContent, VTContent, GraphicsContent, RemoteContent, MicContent } from 'tv-automation-sofie-blueprints-integration'
import { createPieceTransitionGeneric, CreatePieceGeneric, checkAndPlaceOnScreen, CreatePieceGenericEnable } from '../pieces'
import { CreateTransitionAtemTimelineObject, CreateCCGMediaTimelineObject, CreateAtemTimelineObject, CreateLawoAutomixTimelineObject } from './timeline'
import { SourceLayer, CasparLLayer, AtemLLayer, LawoLLayer } from '../../../types/layers'
import { Attributes, GetInputValue } from '../sources'
import { CreateContentCam, CreateContentVT, CreateContentGraphics, CreateContentRemote } from '../content'
import { CreateEnableForTimelineObject } from '../timeline'

/**
 * Creates a transition piece.
 * @param {Piece} piece Piece to generate.
 * @param {AtemTransitionStyle} transition Transition style.
 * @param {number} duration Length of transition.
 */
export function CreatePieceInTransition (piece: Piece, transition: AtemTransitionStyle, duration: number, input: number): IBlueprintPiece {
	let p = createPieceTransitionGeneric(piece, duration)
	let content = literal<TransitionContent>({
		timelineObjects: _.compact<TSRTimelineObj>([
			CreateTransitionAtemTimelineObject({ start: 0, duration: duration }, transition, input)
		])
	})
	p.content = content
	p.enable.start = 0

	return p
}

/**
 * Creates an out transition of given duration.
 * @param {Piece} piece Piece to transition.
 * @param {AtemTransitionStyle} transition Transition type.
 * @param {number} duration Length of transition.
 */
export function CreatePieceOutTransition (piece: Piece, transition: AtemTransitionStyle, duration: number, input: number): IBlueprintPiece {
	let p = createPieceTransitionGeneric(piece, duration)

	let content = literal<TransitionContent>({
		timelineObjects: _.compact<TSRTimelineObj>([
			CreateTransitionAtemTimelineObject({ start: piece.duration - duration, duration: duration }, transition, input)
		])
	})
	p.content = content
	p.enable.start = piece.duration - duration

	return p
}

/**
 * Creates a breaker piece.
 * @param piece Piece to create.
 * @param duration Transition duraation.
 */
export function CreatePieceBreaker (piece: Piece, duration: number): IBlueprintPiece {
	let p = literal<IBlueprintPiece>({
		_id: '',
		externalId: piece.id,
		name: 'Breaker: ' + (piece.clipName || duration),
		enable: {
			start: 0,
			duration: duration
		},
		outputLayerId: 'pgm0',
		sourceLayerId: SourceLayer.PgmTransition,
		isTransition: true,
		content: literal<TransitionContent>({
			timelineObjects: _.compact<TSRTimelineObj>([
				CreateCCGMediaTimelineObject({ start: 0, duration: duration }, CasparLLayer.CasparPlayerWipe, piece.clipName),
				CreateAtemTimelineObject({ start: 0 }, AtemLLayer.AtemMEProgram, 1000, AtemTransitionStyle.WIPE) // TODO: Get input from Sofie
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
	p.name = params.piece.attributes[Attributes.CAMERA]
	let content: CameraContent = CreateContentCam(params.config, params.piece)

	if (checkAndPlaceOnScreen(p, params.piece.attributes)) {
		content.timelineObjects = _.compact<TSRTimelineObj>([
			literal<TimelineObjAtemME>({
				id: '',
				enable: CreateEnableForTimelineObject(params.piece),
				priority: 1,
				layer: AtemLLayer.AtemAuxScreen,
				content: {
					deviceType: DeviceType.ATEM,
					type: TimelineContentTypeAtem.ME,
					me: {
						input: GetInputValue(params.config.context, params.config.sourceConfig, params.piece.attributes[Attributes.CAMERA]),
						transition: transition
					}
				}
			})
		])
	} else {
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
								input: GetInputValue(params.config.context, params.config.sourceConfig, params.piece.attributes[Attributes.CAMERA]),
								transition: transition
							}
						}
					}),

					CreateLawoAutomixTimelineObject({ start: 0 })
				])
				break
		}
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
				CreateCCGMediaTimelineObject(CreateEnableForTimelineObject(params.piece), CasparLLayer.CasparPlayerClip, params.piece.clipName)
			])
			break
	}

	// TODO: if it should be placed on a screen, it should probably go out over an aux.
	if (!checkAndPlaceOnScreen(p, params.piece.attributes)) {
		content.timelineObjects.push(
			CreateAtemTimelineObject(CreateEnableForTimelineObject(params.piece), AtemLLayer.AtemMEProgram, params.config.config.studio.AtemSource.Server1, transition)
		)
		content.timelineObjects.push(
			CreateLawoAutomixTimelineObject({ start: 0 })
		)
		content.timelineObjects.push(
			literal<TimelineObjLawoSource>({
				id: '',
				enable: { start: 0 },
				priority: 1,
				layer: LawoLLayer.LawoSourceClipStk,
				content: {
					deviceType: DeviceType.LAWO,
					type: TimelineContentTypeLawo.SOURCE,
					'Fader/Motor dB Value': {
						value: 0,
						transitionDuration: 10
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
				CreateCCGMediaTimelineObject(CreateEnableForTimelineObject(params.piece), CasparLLayer.CasparCGGraphics, params.piece.clipName)
			])

			if (checkAndPlaceOnScreen(p, params.piece.attributes)) {
				content.timelineObjects.push(
					// TODO: input should be aux?
					CreateAtemTimelineObject(CreateEnableForTimelineObject(params.piece), AtemLLayer.AtemAuxScreen, params.config.config.studio.AtemSource.Server1, transition, { mix: { rate: 100 } })
				)
			} else {
				content.timelineObjects.push(
					CreateAtemTimelineObject(CreateEnableForTimelineObject(params.piece), AtemLLayer.AtemMEProgram, params.config.config.studio.AtemSource.Server1, AtemTransitionStyle.WIPE)
				)
			}
			break
		default:
			content.timelineObjects = _.compact<TSRTimelineObj>([
				CreateCCGMediaTimelineObject(CreateEnableForTimelineObject(params.piece), CasparLLayer.CasparCGGraphics, params.piece.clipName)
			])

			if (!checkAndPlaceOnScreen(p, params.piece.attributes)) {
				CreateAtemTimelineObject(CreateEnableForTimelineObject(params.piece), AtemLLayer.AtemMEProgram, params.config.config.studio.AtemSource.Server1, AtemTransitionStyle.CUT)
			}
			break
	}

	p.content = content

	return p
}

/**
 * Creates a remote source.
 * @param params Piece to create.
 * @param transition In transition.
 */
export function CreatePieceRemote (params: PieceParams, transition: AtemTransitionStyle): IBlueprintAdLibPiece | IBlueprintPiece {
	let p = CreatePieceGeneric(params.piece)

	p.sourceLayerId = SourceLayer.PgmRemote
	p.name = params.piece.attributes[Attributes.REMOTE]

	let content: RemoteContent = CreateContentRemote(params.config, params.piece)

	switch (params.context) {
		default:
			content.timelineObjects = _.compact<TSRTimelineObj>([
				CreateAtemTimelineObject(
					CreateEnableForTimelineObject(params.piece),
					AtemLLayer.AtemMEProgram,
					GetInputValue(params.config.context, params.config.sourceConfig, params.piece.attributes[Attributes.REMOTE]),
					transition
				),
				CreateLawoAutomixTimelineObject({ start: 0 })
			])
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
		CreateCCGMediaTimelineObject(CreateEnableForTimelineObject(params.piece), CasparLLayer.CasparCGGraphics, params.piece.clipName),

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
							upstreamKeyerId: 0,
							onAir: true
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
			CreateLawoAutomixTimelineObject({ start: 0 })
		])
	}
	p.content = content

	return p
}
