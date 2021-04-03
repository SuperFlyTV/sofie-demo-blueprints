import { IBlueprintAdLibPiece, IBlueprintPiece, PieceLifespan, TSR } from '@sofie-automation/blueprints-integration'
import { GraphicObject, ObjectType, SomeObject } from '../../common/definitions/objects'
import { literal } from '../../common/util'
import { CasparCGLayers } from '../../studio0/layers'
import { getOutputLayerForSourceLayer, SourceLayer } from '../layers'

export interface GraphicsResult {
	pieces: IBlueprintPiece[]
	adLibPieces: IBlueprintAdLibPiece[]
}

function getGraphicSourceLayer(object: GraphicObject): SourceLayer {
	if (object.clipName.match(/ticker/i)) {
		return SourceLayer.Ticker
	} else if (object.clipName.match(/strap/i)) {
		return SourceLayer.Strap
	} else {
		return SourceLayer.LowerThird
	}
}
function getGraphicTlLayer(object: GraphicObject): CasparCGLayers {
	if (object.clipName.match(/ticker/i)) {
		return CasparCGLayers.CasparCGGraphicsTicker
	} else if (object.clipName.match(/strap/i)) {
		return CasparCGLayers.CasparCGGraphicsStrap
	} else {
		return CasparCGLayers.CasparCGGraphicsLowerThird
	}
}

function getGraphicTlObject(object: GraphicObject): TSR.TSRTimelineObj[] {
	return [
		literal<TSR.TimelineObjCCGTemplate>({
			id: '',
			enable: {
				start: 0, // TODO - this might not be quite right
			},
			layer: getGraphicTlLayer(object),
			content: {
				deviceType: TSR.DeviceType.CASPARCG,
				type: TSR.TimelineContentTypeCasparCg.TEMPLATE,

				templateType: 'html',
				name: object.clipName,
				data: {
					...object.attributes,
				},
				useStopCommand: true,
			},
		}),
	]
}
function parseGraphic(object: GraphicObject): IBlueprintPiece {
	const sourceLayer = getGraphicSourceLayer(object)

	return {
		externalId: object.id,
		name: `${object.clipName} | ${object.attributes.name}`, // todo - add info
		lifespan: sourceLayer === SourceLayer.Ticker ? PieceLifespan.OutOnRundownEnd : PieceLifespan.WithinPart, // todo - infinite modes
		sourceLayerId: sourceLayer,
		outputLayerId: getOutputLayerForSourceLayer(sourceLayer),
		content: {
			timelineObjects: getGraphicTlObject(object),
		},
		enable: {
			start: object.objectTime,
			duration: object.duration > 0 ? object.duration : undefined,
		},
	}
}
function parseAdlibGraphic(object: GraphicObject, index: number): IBlueprintAdLibPiece {
	return {
		externalId: object.id,
		name: `${object.clipName} | ${object.attributes.name}`, // todo - add info
		lifespan: PieceLifespan.WithinPart, // todo - infinite modes
		sourceLayerId: SourceLayer.LowerThird,
		outputLayerId: getOutputLayerForSourceLayer(SourceLayer.LowerThird),
		content: {
			timelineObjects: getGraphicTlObject(object),
		},
		_rank: index, // todo - probably some offset for ordering
		expectedDuration: object.duration,
	}
}

export function parseGraphicsFromObjects(objects: SomeObject[]): GraphicsResult {
	const graphicsObjects = objects.filter((o): o is GraphicObject => o.objectType === ObjectType.Graphic)

	return {
		pieces: graphicsObjects.filter((o) => !o.isAdlib).map((o) => parseGraphic(o)),
		adLibPieces: graphicsObjects.filter((o) => !!o.isAdlib).map((o, i) => parseAdlibGraphic(o, i)),
	}
}
