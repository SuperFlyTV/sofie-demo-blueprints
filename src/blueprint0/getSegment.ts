import * as _ from 'underscore'
import * as objectPath from 'object-path'
import {
	SegmentContext, IngestSegment, BlueprintResultSegment, IBlueprintSegment, BlueprintResultPart, IngestPart, IBlueprintPart, IBlueprintPiece, PieceEnable, IBlueprintAdLibPiece, PieceLifespan, VTContent, CameraContent, GraphicsContent, ScriptContent
} from 'tv-automation-sofie-blueprints-integration'
import { literal, isAdLibPiece } from '../common/util'
import { SourceLayer, AtemLLayer, CasparLLayer } from '../types/layers'
import { Piece } from '../types/classes'
import { TSRTimelineObj, DeviceType, TimelineContentTypeAtem, AtemTransitionStyle, TimelineObjAtemME, TimelineObjCCGMedia, TimelineContentTypeCasparCg } from 'timeline-state-resolver-types'
import { TimelineEnable } from 'timeline-state-resolver-types/dist/superfly-timeline'

export function getSegment (context: SegmentContext, ingestSegment: IngestSegment): BlueprintResultSegment {
	const segment = literal<IBlueprintSegment>({
		name: ingestSegment.name,
		metaData: {}
	})

	const parts: BlueprintResultPart[] = []

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

					// Iterate over pieces + generate.
					for (let i = 0; i < pieceList.length; i++) {
						let piece = pieceList[i]
						switch (piece.objectType) {
							case 'video':
								createPieceByType(piece, createPieceVideo, pieces, adLibPieces, type)
								break
							case 'camera':
								createPieceByType(piece, createPieceCam, pieces, adLibPieces, type)
								break
							case 'graphic':
								createPieceByType(piece, createPieceGraphic, pieces, adLibPieces, type)
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
 * Creates a cam piece.
 * @param {Piece} piece Piece to evaluate.
 * @param {string} context Context the piece belongs to.
 */
function createPieceCam (piece: Piece, context: string): IBlueprintAdLibPiece | IBlueprintPiece {
	let p = createPieceGeneric(piece)

	p.sourceLayerId = SourceLayer.PgmCam
	p.name = piece.attributes['attr0'] // TODO: Pull this from attributes?
	let content: CameraContent = {
		studioLabel: 'Spreadsheet Studio',
		switcherInput: 1000,
		timelineObjects: _.compact<TSRTimelineObj>([])
	}

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
							input: 1000, // TODO: Fetch this from Sofie
							transition: AtemTransitionStyle.CUT
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
 */
function createPieceVideo (piece: Piece, context: string): IBlueprintAdLibPiece | IBlueprintPiece {
	let p = createPieceGeneric(piece)

	p.sourceLayerId = SourceLayer.PgmClip

	let content: VTContent = {
		fileName: piece.clipName,
		path: piece.clipName,
		firstWords: '',
		lastWords: '',
		sourceDuration: piece.duration ? piece.duration : 0,
		timelineObjects: _.compact<TSRTimelineObj>([])
	}

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
						input: 1000, // TODO: This should be the CasparCG input.
						transition: AtemTransitionStyle.CUT
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
 */
function createPieceGraphic (piece: Piece, context: string): IBlueprintAdLibPiece | IBlueprintPiece {
	let p = createPieceGeneric(piece)

	p.sourceLayerId = SourceLayer.PgmGraphicsSuper

	let content: GraphicsContent = {
		fileName: piece.clipName,
		path: piece.clipName,
		timelineObjects: _.compact<TSRTimelineObj>([])
	}

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
						layer: AtemLLayer.AtemMEProgram,
						content: {
							deviceType: DeviceType.ATEM,
							type: TimelineContentTypeAtem.ME,
							me: {
								input: 1000, // TODO: This should be the CasparCG input.
								transition: AtemTransitionStyle.CUT
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
								input: 1000, // TODO: This should be the CasparCG input.
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
								input: 1000, // TODO: This should be the CasparCG input.
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
		sourceDuration: Number(p.enable.start) || 0
	}

	p.content = content

	return p
}

/**
 * Creates a piece using a given function.
 * @param {Piece} piece Piece to create.
 * @param {(p: Piece) => IBlueprintPiece | IBlueprintAdLibPiece} creator Function for creating the piece.
 * @param {IBlueprintPiece[]} pieces Array of IBlueprintPiece to add regular pieces to.
 * @param {IBlueprintAdLibPiece[]} adLibPieces Array of IBlueprintAdLibPiece to add adLib pieces to.
 * @param {string} context The part type the piece belogs to e.g. 'HEAD'
 */
function createPieceByType (
		piece: Piece, creator: (p: Piece, context: string) => IBlueprintPiece | IBlueprintAdLibPiece,
		pieces: IBlueprintPiece[],
		adLibPieces: IBlueprintAdLibPiece[],
		context: string
	) {
	let p = creator(piece, context)
	if (p.content) {
		if (isAdLibPiece(p)) {
			adLibPieces.push(p as IBlueprintAdLibPiece)
		} else {
			pieces.push(p as IBlueprintPiece)
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
