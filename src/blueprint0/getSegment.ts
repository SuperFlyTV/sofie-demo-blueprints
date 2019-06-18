import * as _ from 'underscore'
import * as objectPath from 'object-path'
import {
	SegmentContext, IngestSegment, BlueprintResultSegment, IBlueprintSegment, BlueprintResultPart, IngestPart, IBlueprintPart, IBlueprintPiece, PieceEnable, IBlueprintAdLibPiece, PieceLifespan, VTContent, CameraContent, GraphicsContent, ScriptContent, TransitionContent, SplitsContent, SourceLayerType, RemoteContent
} from 'tv-automation-sofie-blueprints-integration'
import { literal, isAdLibPiece } from '../common/util'
import { SourceLayer, AtemLLayer, CasparLLayer } from '../types/layers'
import { Piece, BoxProps } from '../types/classes'
import { TSRTimelineObj, DeviceType, TimelineContentTypeAtem, AtemTransitionStyle, TimelineObjAtemME, TimelineObjCCGMedia, TimelineContentTypeCasparCg, SuperSourceBox } from 'timeline-state-resolver-types'
import { TimelineEnable } from 'timeline-state-resolver-types/dist/superfly-timeline'
import { parseConfig, BlueprintConfig } from './helpers/config'
import { parseSources, SourceInfo, getInputValue } from './helpers/sources'

interface SegmentConf {
	context: SegmentContext,
	config: BlueprintConfig
	sourceConfig: SourceInfo[]
}

export function getSegment (context: SegmentContext, ingestSegment: IngestSegment): BlueprintResultSegment {
	const config: SegmentConf = {
		context: context,
		config: parseConfig(context),
		sourceConfig: parseSources(context, parseConfig(context))
	}
	const segment = literal<IBlueprintSegment>({
		name: ingestSegment.name,
		metaData: {}
	})
	const parts: BlueprintResultPart[] = []
	const screenWidth = 1920 // TODO: get from Sofie
	const screenHeight = 1080

	if (ingestSegment.payload['float']) {
		return {
			segment,
			parts
		}
	}

	for (const part of ingestSegment.parts) {
		if (!part.payload) {
			// TODO
			context.warning(`Missing payload for part: '${part.name || part.externalId}'`)
		} else if (part.payload['float']) {
			continue
		} else {
			const type = objectPath.get(part.payload, 'type', '') + ''
			if (!type) {
				context.warning(`Missing type for part: '${part.name || part.externalId}'`)
				parts.push(createGeneric(part))
			} else {
				let pieces: IBlueprintPiece[] = []
				let adLibPieces: IBlueprintAdLibPiece[] = []
				if ('pieces' in part.payload) {
					let pieceList = part.payload['pieces'] as Piece[]

					// Generate script
					let script = ''
					if ('script' in part.payload) {
						script += part.payload['script']
					}
					pieceList.forEach(piece => {
						if (piece.script) {
							script += `\n${piece.script}`
						}
					})

					if (type.match(/dve/i)) {
						let length = 0

						for (let i = 0; i < pieceList.length; i++) {
							if (!pieceList[i].objectType.match(/(transition)|(split)/i)) {
								length++
							}
						}

						if (length > 5) {
							// TODO: Report this to spreadsheet
							context.warning('Maximum number of elements in DVE is 4')
						} else if (length < 2) {
							context.warning('Minimum number of elements in DVE is 2')
						} else {
							let sources = Math.min(length, 4)
							let p = createDVE(config, pieceList, sources, screenWidth, screenHeight)
							if (isAdLibPiece(p)) {
								adLibPieces.push(p as IBlueprintAdLibPiece)
							} else {
								pieces.push(p as IBlueprintPiece)
							}
						}
					} else {
						let transitionType = AtemTransitionStyle.CUT

						for (let i = 0; i < pieceList.length; i++) {
							if (pieceList[i].objectType.match(/transition/i)) {
								transitionType = transitionTypeFromString(pieceList[i].attributes['attr0'])
							}
						}

						// Iterate over pieces + generate.
						for (let i = 0; i < pieceList.length; i++) {
							let piece = pieceList[i]
							switch (piece.objectType) {
								case 'video':
									createPieceByType(config, piece, createPieceVideo, pieces, adLibPieces, type, transitionType)
									break
								case 'camera':
									createPieceByType(config, piece, createPieceCam, pieces, adLibPieces, type, transitionType)
									break
								case 'graphic':
									createPieceByType(config, piece, createPieceGraphic, pieces, adLibPieces, type, transitionType)
									break
								case 'overlay':
									createPieceByType(config, piece, createPieceGraphicOverlay, pieces,adLibPieces, type, transitionType)
									break
								case 'transition':
									pieces.push(createPieceInTransition(piece, transitionType, piece.duration || 1000))
									break
								default:
									context.warning(`Missing objectType '${piece.objectType}' for piece: '${piece.clipName || piece.id}'`)
									break
							}

							if (i === 0 && script) {
								pieces.push(createPieceScript(piece, script))
							}
						}
					}
				}
				parts.push(createPart(part, pieces, adLibPieces))
			}
		}
	}

	return {
		segment,
		parts
	}
}

/**
 * Returns the AtemTransitionStyle represented by a string.
 * If no match is found, CUT is returned.
 * @param {string} str Transtion style to match.
 */
function transitionTypeFromString (str: string): AtemTransitionStyle {
	if (str.match(/mix/i)) {
		return AtemTransitionStyle.MIX
	} else if (str.match(/dip/i)) {
		return AtemTransitionStyle.DIP
	} else if (str.match(/wipe/i)) {
		return AtemTransitionStyle.WIPE
	} else if (str.match(/dve/i)) {
		return AtemTransitionStyle.DVE
	} else if (str.match(/sting/i)) {
		return AtemTransitionStyle.STING
	} else {
		return AtemTransitionStyle.CUT
	}
}

/**
 * Creates a DVE Piece.
 * Currently only supports split, not PIP.
 * @param {Piece[]} pieces Pieces to insert into the DVE.
 * @param {number} sources Number of sources to display.
 * @param {number} width Screen width.
 * @param {number} height Screen height.
 */
function createDVE (config: SegmentConf, pieces: Piece[], sources: number, width: number, height: number): IBlueprintPiece | IBlueprintAdLibPiece {
	let dvePiece = pieces[0] // First piece is always assumed to be the DVE.
	pieces = pieces.slice(1, sources + 1)
	let boxes: BoxProps[] = []
	// Right now there are always half the width/height, but could change!
	let boxWidth = 0
	let boxHeight = 0

	switch (sources) {
		case 2:
			boxWidth = width / 2
			boxHeight = height / 2
			boxes = [
				{
					x: -boxWidth,
					y: boxHeight,
					size: boxWidth
				},
				{
					x: 0,
					y: boxHeight,
					size: boxWidth
				}
			]
			break
		case 3:
			boxWidth = width / 2
			boxHeight = height / 2
			boxes = [
				{
					x: -(boxWidth / 2),
					y: boxHeight,
					size: boxWidth
				},
				{
					x: -boxWidth,
					y: 0,
					size: boxWidth
				},
				{
					x: 0,
					y: 0,
					size: boxWidth
				}
			]
			break
		case 4:
			boxWidth = width / 2
			boxHeight = height / 2
			boxes = [
				{
					x: -boxWidth,
					y: boxHeight,
					size: boxWidth
				},
				{
					x: 0,
					y: boxHeight,
					size: boxWidth
				},
				{
					x: -boxWidth,
					y: 0,
					size: boxWidth
				},
				{
					x: 0,
					y: 0,
					size: boxWidth
				}
			]
			break
	}

	let sourceBoxes: SuperSourceBox[] = []

	for (let i = 0; i < sources; i++) {
		sourceBoxes.push(literal<SuperSourceBox>({
			enabled: true,
			source: 1000, // TODO: Get this from Sofie.
			x: boxes[i].x,
			y: boxes[i].y,
			size: boxes[i].size
		}))
	}

	interface SourceMeta {
		type: SourceLayerType
		studioLabel: string
		switcherInput: number | string
	}

	let sourceConfigurations: Array<(VTContent | CameraContent | RemoteContent | GraphicsContent) & SourceMeta> = []

	pieces.forEach(piece => {
		let newContent: (VTContent | CameraContent | RemoteContent | GraphicsContent) & SourceMeta
		switch (piece.objectType) {
			case 'graphic':
				newContent = literal<GraphicsContent & SourceMeta>({...createContentGraphics(piece), ...{
					type: SourceLayerType.GRAPHICS,
					studioLabel: 'Spreadsheet Studio', // TODO: Get from Sofie.
					switcherInput: 1000 // TODO: Get from Sofie.
				}})
				newContent.timelineObjects = _.compact<TSRTimelineObj>([
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
				]),
				sourceConfigurations.push(newContent)
				break
			case 'video':
				newContent = literal<VTContent & SourceMeta>({...createContentVT(piece), ...{
					type: SourceLayerType.VT,
					studioLabel: 'Spreadsheet Studio', // TODO: Get from Sofie.
					switcherInput: 1000 // TODO: Get from Sofie.
				}})
				newContent.timelineObjects = _.compact<TSRTimelineObj>([
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
				]), // TODO
				sourceConfigurations.push(newContent)
				break
			case 'camera':
				newContent = literal<CameraContent & SourceMeta>({...createContentCam(config, piece), ...{
					type: SourceLayerType.CAMERA,
					studioLabel: 'Spreadsheet Studio', // TODO: Get from Sofie.
					switcherInput: 1000 // TODO: Get from Sofie.
				}})
				newContent.timelineObjects = [], // TODO
				sourceConfigurations.push(newContent)
				break
			case 'remote':
				newContent = literal<RemoteContent & SourceMeta>({
					timelineObjects: [], // TODO
					type: SourceLayerType.REMOTE,
					studioLabel: 'Spreadsheet Studio', // TODO: Get from Sofie.
					switcherInput: 1000 // TODO: Get from Sofie.
				})
				sourceConfigurations.push(newContent)
				break
			default:
				config.context.warning(`DVE does not support objectType '${piece.objectType}' for piece: '${piece.clipName || piece.id}'`)
				break
		}
	})

	let p = createPieceGeneric(dvePiece)

	let content: SplitsContent = {
		dveConfiguration: {},
		boxSourceConfiguration: sourceConfigurations,
		timelineObjects: _.compact<TSRTimelineObj>([

		])
	}

	p.content = content
	p.name = `DVE: ${sources} split`

	return p
}

/**
 * Creates a base camera content.
 */
function createContentCam (config: SegmentConf, piece: Piece): CameraContent {
	let content: CameraContent = {
		studioLabel: 'Spreadsheet Studio',
		switcherInput: getInputValue(config.context, config.sourceConfig, piece.attributes['attr0']),
		timelineObjects: _.compact<TSRTimelineObj>([])
	}

	return content
}
/**
 * Creates a base VT content.
 * @param piece Piece used to create content.
 */
function createContentVT (piece: Piece): VTContent {
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
function createContentGraphics (piece: Piece): GraphicsContent {
	let content: GraphicsContent = {
		fileName: piece.clipName,
		path: piece.clipName,
		timelineObjects: _.compact<TSRTimelineObj>([])
	}

	return content
}

/**
 * Creates a generic adLib piece.
 * @param {Piece} piece Piece properties.
 */
function createPieceGenericAdLib (piece: Piece): IBlueprintAdLibPiece {
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
function createPieceGenericEnable (piece: Piece): IBlueprintPiece {
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
function createPieceGeneric (piece: Piece): IBlueprintAdLibPiece | IBlueprintPiece {
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
function createPieceInTransition (piece: Piece, transition: AtemTransitionStyle, duration: number): IBlueprintPiece {
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
function createPieceOutTransition (piece: Piece, transition: AtemTransitionStyle, duration: number): IBlueprintPiece {
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
function createPieceCam (config: SegmentConf, piece: Piece, context: string, transition: AtemTransitionStyle): IBlueprintAdLibPiece | IBlueprintPiece {
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
function createPieceVideo (config: SegmentConf, piece: Piece, context: string, transition: AtemTransitionStyle): IBlueprintAdLibPiece | IBlueprintPiece {
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
function createPieceGraphic (config: SegmentConf, piece: Piece, context: string, transition: AtemTransitionStyle): IBlueprintAdLibPiece | IBlueprintPiece {
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
function createPieceGraphicOverlay (config: SegmentConf, piece: Piece, context: string, transition: AtemTransitionStyle): IBlueprintAdLibPiece | IBlueprintPiece {
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
function createPieceScript (piece: Piece, script: string): IBlueprintPiece {
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
 * Creates a piece using a given function.
 * @param {Piece} piece Piece to create.
 * @param {(config: SegmentConf, p: Piece, context: string, transition: AtemTransitionStyle) => IBlueprintPiece | IBlueprintAdLibPiece} creator Function for creating the piece.
 * @param {IBlueprintPiece[]} pieces Array of IBlueprintPiece to add regular pieces to.
 * @param {IBlueprintAdLibPiece[]} adLibPieces Array of IBlueprintAdLibPiece to add adLib pieces to.
 * @param {string} context The part type the piece belogs to e.g. 'HEAD'
 * @param {AtemTransitionsStyle} transitionType Type of transition to use.
 */
function createPieceByType (
		config: SegmentConf,
		piece: Piece, creator: (config: SegmentConf, p: Piece, context: string, transition: AtemTransitionStyle) => IBlueprintPiece | IBlueprintAdLibPiece,
		pieces: IBlueprintPiece[],
		adLibPieces: IBlueprintAdLibPiece[],
		context: string,
		transitionType?: AtemTransitionStyle
	) {
	let p = creator(config, piece, context, transitionType || AtemTransitionStyle.CUT)
	if (p.content) {
		if (isAdLibPiece(p)) {
			adLibPieces.push(p as IBlueprintAdLibPiece)
		} else {
			pieces.push(p as IBlueprintPiece)

			if (context.match(/titles/i) && piece.objectType.match(/(graphic)|(video)/i)) {
				pieces.push(createPieceOutTransition(piece, transitionType || AtemTransitionStyle.DIP, (1 / 50) * 150 * 1000)) // TODO: Use actual framerate
			}

			if (context.match(/breaker/i) && piece.objectType.match(/(graphic)|(video)/i)) {
				pieces.push(createPieceOutTransition(piece, transitionType || AtemTransitionStyle.DIP, (1 / 50) * 50 * 1000)) // TODO: Use actual framerate
			}

			if (context.match(/package/i) && piece.objectType.match(/video/i)) {
				pieces.push(createPieceInTransition(piece, transitionType || AtemTransitionStyle.MIX, (1 / 50) * 150 * 1000))
				pieces.push(createPieceOutTransition(piece, transitionType || AtemTransitionStyle.DIP, (1 / 50) * 50 * 1000)) // TODO: Use actual framerate
			}
		}
	}
}

/**
 * Creates a generic part. Only used as a placeholder for part types that have not been implemented yet.
 * @param {Piece} piece Piece to evaluate.
 */
function createGeneric (ingestPart: IngestPart): BlueprintResultPart {
	const part = literal<IBlueprintPart>({
		externalId: ingestPart.externalId,
		title: ingestPart.name || 'Unknown',
		metaData: {},
		typeVariant: '',
		expectedDuration: 5000
	})

	const piece = literal<IBlueprintPiece>({
		_id: '',
		externalId: ingestPart.externalId,
		name: part.title,
		enable: { start: 0, duration: 100 },
		outputLayerId: 'pgm0',
		sourceLayerId: SourceLayer.PgmCam
	})

	return {
		part,
		adLibPieces: [],
		pieces: [piece]
	}
}

/**
 * Creates a part from an ingest part and associated pieces.
 * @param {IngestPart} ingestPart Ingest part.
 * @param {IBlueprintPiece[]} pieces Array of pieces.
 */
function createPart (ingestPart: IngestPart, pieces: IBlueprintPiece[], adLibPieces: IBlueprintAdLibPiece[]): BlueprintResultPart {
	const part = literal<IBlueprintPart>({
		externalId: ingestPart.externalId,
		title: ingestPart.name || 'Unknown',
		metaData: {},
		typeVariant: '',
		expectedDuration: calculateExpectedDuration(pieces)
	})

	return {
		part,
		adLibPieces: adLibPieces,
		pieces: pieces
	}
}

/**
 * Calculates the expected duration of a part from component pieces.
 * @param {IBlueprintPiece[]} pieces Pieces to calculate duration for.
 */
function calculateExpectedDuration (pieces: IBlueprintPiece[]): number {
	let duration = 0

	pieces.forEach(piece => {
		duration += (piece.enable.duration as number) // This will get more complicated as more rules are added
	})

	return duration
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

/**
 * Creates an enable object for a timeline object.
 * @param {Piece} piece Piece to create enable for.
 */
function createEnableForTimelineObject (piece: Piece): TimelineEnable {
	let enable: TimelineEnable = {
		start: piece.objectTime ? piece.objectTime : 0
	}

	if (piece.duration) {
		enable.duration = piece.duration
	}

	return piece
}
