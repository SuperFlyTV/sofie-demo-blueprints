import _ = require('underscore')
import { Piece, SegmentConf, SourceMeta, BoxProps } from '../../types/classes'
import { IBlueprintPiece, IBlueprintAdLibPiece, VTContent, CameraContent, RemoteContent, GraphicsContent, SourceLayerType, SplitsContent } from 'tv-automation-sofie-blueprints-integration'
import { SuperSourceBox, TSRTimelineObj } from 'timeline-state-resolver-types'
import { literal } from '../../common/util'
import { CreateContentGraphics, CreateContentVT, CreateContentCam } from './content'
import { getStudioName } from './studio'
import { CreateEnableForTimelineObject, CreateCCGMediaTimelineObject } from './timeline'
import { CasparLLayer, SourceLayer } from '../../types/layers'
import { GetInputValue, Attributes } from './sources'
import { CreatePieceGeneric } from './pieces'

/**
 * Creates a DVE Piece.
 * @param {SegmentConf} config Segment config.
 * @param {Piece[]} pieces Pieces to insert into the DVE.
 * @param {number} sources Number of sources to display.
 * @param {number} width Screen width.
 * @param {number} height Screen height.
 */
export function CreateDVE (config: SegmentConf, pieces: Piece[], sources: number, width: number, height: number): IBlueprintPiece | IBlueprintAdLibPiece {
	let dvePiece = pieces[0]
	if (dvePiece.objectType === 'split') {
		return createSplit(config, pieces, sources, width, height)
	} else {
		return createPIP(config, pieces, width, height)
	}
}

/**
 * Creates DVE source configurations.
 * @param {SegmentConf} config Segment config.
 * @param {Piece[]} pieces Pieces to create.
 * @param {SuperSourceBox[]} sourceBoxes Array of boxes to create.
 */
function createDVESourceConfigurations (config: SegmentConf, pieces: Piece[], sourceBoxes: SuperSourceBox[]): Array<(VTContent | CameraContent | RemoteContent | GraphicsContent) & SourceMeta> {
	let sourceConfigurations: Array<(VTContent | CameraContent | RemoteContent | GraphicsContent) & SourceMeta> = []

	let index = 0
	pieces.forEach(piece => {
		let newContent: (VTContent | CameraContent | RemoteContent | GraphicsContent) & SourceMeta
		switch (piece.objectType) {
			case 'graphic':
				newContent = literal<GraphicsContent & SourceMeta>({...CreateContentGraphics(piece), ...{
					type: SourceLayerType.GRAPHICS,
					studioLabel: getStudioName(config.context),
					switcherInput: config.config.studio.AtemSource.Server2 // TODO: Get from Sofie.
				}})
				newContent.timelineObjects = _.compact<TSRTimelineObj>([
					CreateCCGMediaTimelineObject(CreateEnableForTimelineObject(piece), CasparLLayer.CasparCGGraphics, piece.clipName)
				]),
				sourceConfigurations.push(newContent)
				sourceBoxes[index].source = newContent.switcherInput as number
				break
			case 'video':
				newContent = literal<VTContent & SourceMeta>({...CreateContentVT(piece), ...{
					type: SourceLayerType.VT,
					studioLabel: getStudioName(config.context),
					switcherInput: config.config.studio.AtemSource.Server1
				}})
				newContent.timelineObjects = _.compact<TSRTimelineObj>([
					CreateCCGMediaTimelineObject(CreateEnableForTimelineObject(piece), CasparLLayer.CasparPlayerClip, piece.clipName)
				]), // TODO
				sourceConfigurations.push(newContent)
				sourceBoxes[index].source = newContent.switcherInput as number
				break
			case 'camera':
				newContent = literal<CameraContent & SourceMeta>({...CreateContentCam(config, piece), ...{
					type: SourceLayerType.CAMERA,
					studioLabel: getStudioName(config.context),
					switcherInput: GetInputValue(config.context, config.sourceConfig, piece.attributes[Attributes.CAMERA])
				}})
				newContent.timelineObjects = [], // TODO
				sourceConfigurations.push(newContent)
				sourceBoxes[index].source = newContent.switcherInput as number
				break
			case 'remote':
				newContent = literal<RemoteContent & SourceMeta>({
					timelineObjects: [], // TODO
					type: SourceLayerType.REMOTE,
					studioLabel: getStudioName(config.context),
					switcherInput: GetInputValue(config.context, config.sourceConfig, piece.attributes[Attributes.REMOTE])
				})
				sourceConfigurations.push(newContent)
				sourceBoxes[index].source = newContent.switcherInput as number
				break
			default:
				config.context.warning(`DVE does not support objectType '${piece.objectType}' for piece: '${piece.clipName || piece.id}'`)
				break
		}
		index++
	})

	return sourceConfigurations
}

/**
 * Creates a PIP.
 * @param {SegmentConf} config Segment config.
 * @param {Piece[]} pieces Pieces to create.
 * @param {number} width Frame width.
 * @param {number} height Frame height.
 */
function createPIP (config: SegmentConf, pieces: Piece[], width: number, height: number) {
	let dvePiece = pieces[0]
	pieces = pieces.slice(1, 3)
	let boxes: BoxProps[] = [
		{
			x: width,
			y: height,
			size: width
		},
		{
			x: width / 5,
			y: height / 5,
			size: width / 5
		}
	]

	let sourceBoxes: SuperSourceBox[] = []

	for (let i = 0; i < 2; i++) {
		sourceBoxes.push(literal<SuperSourceBox>({
			enabled: true,
			source: 1000, // TODO: Get this from Sofie.
			x: boxes[i].x,
			y: boxes[i].y,
			size: boxes[i].size
		}))
	}

	let p = CreatePieceGeneric(dvePiece)
	p.sourceLayerId = SourceLayer.PgmSplit

	let content: SplitsContent = {
		dveConfiguration: {},
		boxSourceConfiguration: createDVESourceConfigurations(config, pieces, sourceBoxes),
		timelineObjects: _.compact<TSRTimelineObj>([

		])
	}

	p.content = content
	p.name = `PIP`

	return p
}

/**
 * Creates a DVE Split.
 * @param {SegmentConf} config Segment config.
 * @param {Piece[]} pieces Pieces to create.
 * @param {number} sources Number of sources.
 * @param {number} width Frame width.
 * @param {number} height Frame height.
 */
function createSplit (config: SegmentConf, pieces: Piece[], sources: number, width: number, height: number): IBlueprintPiece | IBlueprintAdLibPiece {
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

	let p = CreatePieceGeneric(dvePiece)
	p.sourceLayerId = SourceLayer.PgmSplit

	let content: SplitsContent = {
		dveConfiguration: {},
		boxSourceConfiguration: createDVESourceConfigurations(config, pieces, sourceBoxes),
		timelineObjects: _.compact<TSRTimelineObj>([

		])
	}

	p.content = content
	p.name = `DVE: ${sources} split`

	return p
}
