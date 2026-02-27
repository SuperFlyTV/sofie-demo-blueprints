import { IBlueprintAdLibPiece, IBlueprintPiece, PieceLifespan, TSR } from '@sofie-automation/blueprints-integration'
import { ObjectType, OGrafGraphicObject, SomeObject } from '../../../common/definitions/objects.js'
import { literal } from '../../../common/util.js'
import { StudioConfig } from '../../studio/helpers/config.js'
import { OGrafLayers } from '../../studio/layers.js'
import { getOutputLayerForSourceLayer, SourceLayer } from '../applyconfig/layers.js'
import { getClipPlayerInput } from './clips.js'
import { createVisionMixerObjects } from './visionMixer.js'
import { TimelineBlueprintExt } from '../../studio/customTypes.js'
import { GraphicsResult } from './graphics.js'

export function parseOGrafGraphicsFromObjects(config: StudioConfig, objects: SomeObject[]): GraphicsResult {
	const graphicsObjects = objects.filter((o): o is OGrafGraphicObject => o.objectType === ObjectType.OGrafGraphic)

	return {
		pieces: graphicsObjects.filter((o) => !o.isAdlib).map((o) => parseOGrafGraphic(config, o)),
		adLibPieces: graphicsObjects.filter((o) => Boolean(o.isAdlib)).map((o, i) => parseAdlibOGrafGraphic(config, o, i)),
	}
}

function parseOGrafGraphic(config: StudioConfig, object: OGrafGraphicObject): IBlueprintPiece {
	const sourceLayer = getSourceLayer(object)

	return {
		externalId: object.id,
		name: makeOGrafName(object),
		lifespan: PieceLifespan.WithinPart,
		sourceLayerId: sourceLayer,
		outputLayerId: getOutputLayerForSourceLayer(sourceLayer),
		content: {
			timelineObjects: getGraphicTlObject(config, object, false),

			previewRenderer: config.previewRenderer,
		},
		enable: {
			start: object.objectTime ?? 0,
			duration: object.duration > 0 ? object.duration : undefined,
		},
		prerollDuration: config.casparcgLatency,
	}
}
function parseAdlibOGrafGraphic(config: StudioConfig, object: OGrafGraphicObject, index: number): IBlueprintAdLibPiece {
	const sourceLayer = getSourceLayer(object)

	return {
		externalId: object.id,
		name: makeOGrafName(object),
		lifespan: PieceLifespan.WithinPart,
		sourceLayerId: sourceLayer,
		outputLayerId: getOutputLayerForSourceLayer(sourceLayer),
		content: {
			timelineObjects: getGraphicTlObject(config, object, true),
		},
		_rank: index, // todo - probably some offset for ordering
		expectedDuration: object.duration,
	}
}

function getSourceLayer(object: OGrafGraphicObject): SourceLayer {
	switch (object.attributes.type) {
		case 'full-screen':
			return SourceLayer.OGrafFullScreen
		case 'overlay1':
			return SourceLayer.OGrafOverlay1
		case 'overlay2':
			return SourceLayer.OGrafOverlay2
		case 'overlay3':
			return SourceLayer.OGrafOverlay3
		default:
			return SourceLayer.OGrafOverlay1
	}
}
function getGraphicTlLayer(object: OGrafGraphicObject): OGrafLayers {
	switch (object.attributes.type) {
		case 'full-screen':
			return OGrafLayers.OGrafFullScreen
		case 'overlay1':
			return OGrafLayers.OGrafOverlay1
		case 'overlay2':
			return OGrafLayers.OGrafOverlay2
		case 'overlay3':
			return OGrafLayers.OGrafOverlay3
		default:
			return OGrafLayers.OGrafOverlay1
	}
}

function getGraphicTlObject(
	config: StudioConfig,
	object: OGrafGraphicObject,
	isAdlib?: boolean
): TimelineBlueprintExt[] {
	const fullscreenAtemInput = getClipPlayerInput(config)
	const timelineLayer = getGraphicTlLayer(object)
	const isFullscreen = timelineLayer === OGrafLayers.OGrafFullScreen

	return [
		literal<TimelineBlueprintExt<TSR.TimelineContentOgrafAny>>({
			id: '',
			enable: {
				start: 0, // TODO - this might not be quite right
			},
			layer: timelineLayer,
			priority: 1 + (isAdlib ? 10 : 0),
			content: {
				deviceType: TSR.DeviceType.OGRAF,
				type: TSR.TimelineContentTypeOgraf.GRAPHIC,

				graphicId: object.attributes['ograf-id'],
				playing: true,

				data: object.attributes['ograf-data'],
				useStopCommand: true,
			},
		}),
		...(isFullscreen ? createVisionMixerObjects(config, fullscreenAtemInput?.input || 0, config.casparcgLatency) : []),
	]
}

function makeOGrafName(object: OGrafGraphicObject): string {
	const data = object.attributes['ograf-data'] || {}

	if (Object.keys(data).length === 0) {
		// data is empty
		return object.clipName
	}

	{
		let canUseThis = true
		const nameParts: string[] = []
		for (const [key, value] of Object.entries<unknown>(data)) {
			if (typeof value === 'string') {
				// omit some values that likely won't be useful to show in the name:
				if (
					value.startsWith('#') || // likely a color
					value.startsWith('{') // likely json
				)
					continue

				nameParts.push(value)
			} else if (typeof value === 'number') {
				nameParts.push(`${value}`)
			} else if (typeof value === 'boolean') {
				if (value) nameParts.push(`${key}`)
			} else {
				canUseThis = false
			}
		}
		if (canUseThis) return `${object.clipName} | ${nameParts.join(', ')}`
	}

	return `${object.clipName} | ${JSON.stringify(data)}`
}
