import { IBlueprintAdLibPiece, IBlueprintPiece, PieceLifespan, TSR } from '@sofie-automation/blueprints-integration'
import { GraphicObject, ObjectType, SomeObject } from '../../common/definitions/objects'
import { literal } from '../../common/util'
import { StudioConfig } from '../../studio0/helpers/config'
import { CasparCGLayers } from '../../studio0/layers'
import { getOutputLayerForSourceLayer, SourceLayer } from '../layers'
import { getClipPlayerInput } from './clips'
import { createVisionMixerObjects } from './visionMixer'
import { TimelineBlueprintExt } from '../../studio0/customTypes'

export interface GraphicsResult {
	pieces: IBlueprintPiece[]
	adLibPieces: IBlueprintAdLibPiece[]
}

function getGraphicSourceLayer(object: GraphicObject): SourceLayer {
	if (object.clipName.match(/ticker/i)) {
		return SourceLayer.Ticker
	} else if (object.clipName.match(/strap/i)) {
		return SourceLayer.Strap
	} else if (object.clipName.match(/fullscreen/i)) {
		return SourceLayer.GFX
	} else {
		return SourceLayer.LowerThird
	}
}
function getGraphicTlLayer(object: GraphicObject): CasparCGLayers {
	if (object.clipName.match(/ticker/i)) {
		return CasparCGLayers.CasparCGGraphicsTicker
	} else if (object.clipName.match(/strap/i)) {
		return CasparCGLayers.CasparCGGraphicsStrap
	} else if (object.clipName.match(/fullscreen/i)) {
		return CasparCGLayers.CasparCGClipPlayer
	} else {
		return CasparCGLayers.CasparCGGraphicsLowerThird
	}
}

function getGraphicTlObject(config: StudioConfig, object: GraphicObject, isAdlib?: boolean): TimelineBlueprintExt[] {
	const fullscreenAtemInput = getClipPlayerInput(config)
	const isFullscreen = object.clipName.match(/fullscreen/i)

	return [
		literal<TimelineBlueprintExt<TSR.TimelineContentCCGTemplate>>({
			id: '',
			enable: {
				start: 0, // TODO - this might not be quite right
			},
			layer: getGraphicTlLayer(object),
			priority: 1 + (isAdlib ? 10 : 0),
			content: {
				deviceType: TSR.DeviceType.CASPARCG,
				type: TSR.TimelineContentTypeCasparCg.TEMPLATE,

				templateType: 'html',
				name: object.clipName,
				data: {
					...object.attributes,
				},
				useStopCommand: isFullscreen ? false : true,
			},
		}),
		...(isFullscreen ? createVisionMixerObjects(config, fullscreenAtemInput?.input || 0, config.casparcgLatency) : []),
	]
}
function parseGraphic(config: StudioConfig, object: GraphicObject): IBlueprintPiece {
	const sourceLayer = getGraphicSourceLayer(object)
	const lifespan = getGraphicLifespan(sourceLayer, object)

	return {
		externalId: object.id,
		name: `${object.clipName} | ${Object.values(object.attributes)
			.filter((v) => v !== 'true' && v !== 'false')
			.join(', ')}`, // todo - add info
		lifespan,
		sourceLayerId: sourceLayer,
		outputLayerId: getOutputLayerForSourceLayer(sourceLayer),
		content: {
			timelineObjects: getGraphicTlObject(config, object, false),

			payload: {
				content: {
					...object.attributes,
					adlib: undefined,
				},
				manifest: '',
				template: {
					event: '',
					layer: '',
					name: object.clipName,
				},
			},
			previewRenderer: config.previewRenderer,
		},
		enable: {
			start: object.objectTime,
			duration: object.duration > 0 ? object.duration : undefined,
		},
		prerollDuration: config.casparcgLatency,
	}
}
export function parseAdlibGraphic(config: StudioConfig, object: GraphicObject, index: number): IBlueprintAdLibPiece {
	const sourceLayer = getGraphicSourceLayer(object)
	const lifespan = getGraphicLifespan(sourceLayer, object)
	const isFullscreen = object.clipName.match(/fullscreen/i)

	return {
		externalId: object.id,
		name: `${object.clipName} | ${Object.values(object.attributes)
			.filter((v) => v !== 'true' && v !== 'false')
			.join(', ')}`, // todo - add info
		lifespan,
		sourceLayerId: sourceLayer,
		outputLayerId: getOutputLayerForSourceLayer(sourceLayer),
		prerollDuration: isFullscreen ? config.casparcgLatency : 0,
		content: {
			timelineObjects: getGraphicTlObject(config, object, true),

			payload: {
				content: {
					...object.attributes,
					adlib: undefined,
				},
				manifest: '',
				template: {
					event: '',
					layer: '',
					name: object.clipName,
				},
			},
		},
		_rank: index, // todo - probably some offset for ordering
		expectedDuration: object.duration,
	}
}

export function parseGraphicsFromObjects(config: StudioConfig, objects: SomeObject[]): GraphicsResult {
	const graphicsObjects = objects.filter((o): o is GraphicObject => o.objectType === ObjectType.Graphic)

	return {
		pieces: graphicsObjects.filter((o) => !o.isAdlib).map((o) => parseGraphic(config, o)),
		adLibPieces: graphicsObjects.filter((o) => !!o.isAdlib).map((o, i) => parseAdlibGraphic(config, o, i)),
	}
}
function getGraphicLifespan(sourceLayer: SourceLayer, object: GraphicObject): PieceLifespan {
	if (sourceLayer === SourceLayer.Ticker) {
		return PieceLifespan.OutOnRundownEnd
	}

	if (sourceLayer === SourceLayer.Logo) {
		return PieceLifespan.OutOnRundownEnd
	}

	if (sourceLayer === SourceLayer.Strap && (!object.attributes['text'] || object.attributes['text'].match(/live/i))) {
		return PieceLifespan.OutOnSegmentEnd
	}

	return PieceLifespan.WithinPart
}
