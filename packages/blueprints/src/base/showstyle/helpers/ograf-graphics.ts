import { IBlueprintAdLibPiece, IBlueprintPiece, PieceLifespan, TSR } from '@sofie-automation/blueprints-integration'
import { GraphicObjectBase, ObjectType, OGrafGraphicObject, SomeObject } from '../../../common/definitions/objects.js'
import { literal } from '../../../common/util.js'
import { StudioConfig, VisionMixerDevice } from '../../studio/helpers/config.js'
import { OGrafLayers } from '../../studio/layers.js'
import { getOutputLayerForSourceLayer, SourceLayer } from '../applyconfig/layers.js'
import { getClipPlayerInput } from './clips.js'
import { createVisionMixerObjects } from './visionMixer.js'
import { TimelineBlueprintExt } from '../../studio/customTypes.js'
import { GraphicsResult } from './graphics.js'

const OGRAF_CLEAR_COMMAND_DURATION = 1000
const OGRAPH_DEVICE_TYPE = ((TSR.DeviceType as any).OGRAF ?? 'OGRAF') as TSR.DeviceType
const OGRAPH_CONTENT_TYPE = {
	GRAPHIC: ((TSR as any).TimelineContentTypeOgraf?.GRAPHIC ?? 'graphic') as string,
} as const

export function parseOGrafGraphicsFromObjects(config: StudioConfig, objects: SomeObject[]): GraphicsResult {
	const nativeOGrafObjects = objects.filter((o): o is OGrafGraphicObject => o.objectType === ObjectType.OGrafGraphic)
	const convertedLegacyObjects = objects
		.filter((o): o is GraphicObjectBase => o.objectType === ObjectType.Graphic)
		.map((o) => convertLegacyGraphicToOGraf(config, o))
		.filter((o): o is OGrafGraphicObject => !!o)

	const graphicsObjects = [...nativeOGrafObjects, ...convertedLegacyObjects]

	return {
		pieces: graphicsObjects.filter((o) => !o.isAdlib).map((o) => parseOGrafGraphic(config, o)),
		adLibPieces: graphicsObjects.filter((o) => Boolean(o.isAdlib)).map((o, i) => parseAdlibOGrafGraphic(config, o, i)),
	}
}

function convertLegacyGraphicToOGraf(config: StudioConfig, object: GraphicObjectBase): OGrafGraphicObject | undefined {
	if (config.visionMixer.type !== VisionMixerDevice.OBS) return undefined

	const mapped = mapLegacyClipToOGraf(object.clipName)
	if (!mapped) return undefined

	const attributes: OGrafGraphicObject['attributes'] = {
		'ograf-id': mapped.graphicId,
		'ograf-data': sanitizeLegacyData(object.attributes),
		type: mapped.type,
	}

	return {
		...object,
		objectType: ObjectType.OGrafGraphic,
		attributes,
	}
}

function mapLegacyClipToOGraf(
	clipName: string
): { graphicId: string; type: OGrafGraphicObject['attributes']['type'] } | undefined {
	switch (clipName) {
		case 'gfx/fullscreen':
			return { graphicId: 'demo-blueprint-fullscreen', type: 'full-screen' }
		case 'gfx/head':
			return { graphicId: 'demo-blueprint-head', type: 'overlay1' }
		case 'gfx/l3d':
			return { graphicId: 'demo-blueprint-l3d', type: 'overlay1' }
		case 'gfx/wipe':
			return { graphicId: 'demo-blueprint-wipe', type: 'overlay1' }
		case 'gfx/strap':
			return { graphicId: 'demo-blueprint-strap', type: 'overlay2' }
		case 'gfx/ticker':
			return { graphicId: 'demo-blueprint-ticker', type: 'overlay3' }
		default:
			return undefined
	}
}

function sanitizeLegacyData(attributes: Record<string, unknown>): Record<string, unknown> {
	const data = { ...attributes }
	delete data['adlib']
	delete data['template']
	delete data['pieceName']
	return data
}

function parseOGrafGraphic(config: StudioConfig, object: OGrafGraphicObject): IBlueprintPiece {
	const sourceLayer = getSourceLayer(object)
	const isFullscreen = sourceLayer === SourceLayer.OGrafFullScreen
	const duration = getPieceDuration(object)

	return {
		externalId: object.id,
		name: makeOGrafName(object),
		lifespan: getPieceLifespan(object, isFullscreen),
		sourceLayerId: sourceLayer,
		outputLayerId: getOutputLayerForSourceLayer(sourceLayer),
		content: {
			timelineObjects: getGraphicTlObject(config, object, false),

			previewRenderer: config.previewRenderer,
		},
		enable: {
			start: object.objectTime ?? 0,
			duration,
		},
		prerollDuration: config.casparcgLatency,
	}
}

function getPieceLifespan(object: OGrafGraphicObject, isFullscreen: boolean): PieceLifespan {
	if (isFullscreen) return PieceLifespan.WithinPart
	if (object.duration > 0) return PieceLifespan.OutOnSegmentEnd
	return PieceLifespan.WithinPart
}

function getPieceDuration(object: OGrafGraphicObject): number | undefined {
	if (object.duration <= 0) return undefined
	return object.duration + OGRAF_CLEAR_COMMAND_DURATION
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
			return OGrafLayers.OGrafFullScreenLoad
		case 'overlay1':
			return OGrafLayers.OGrafOverlay1Load
		case 'overlay2':
			return OGrafLayers.OGrafOverlay2Load
		case 'overlay3':
			return OGrafLayers.OGrafOverlay3Load
		default:
			return OGrafLayers.OGrafOverlay1Load
	}
}

function getOGrafGraphicId(object: OGrafGraphicObject): string {
	if (object.attributes['ograf-id']) return object.attributes['ograf-id']
	if (object.clipName.startsWith('ograf-')) return object.clipName.slice('ograf-'.length)
	return object.clipName
}

function getOGrafGraphicData(object: OGrafGraphicObject): Record<string, unknown> {
	const data = object.attributes['ograf-data']
	if (data && typeof data === 'object') return data as Record<string, unknown>
	return {}
}

function getGraphicTlObject(
	config: StudioConfig,
	object: OGrafGraphicObject,
	isAdlib?: boolean
): TimelineBlueprintExt[] {
	const fullscreenAtemInput = getClipPlayerInput(config)
	const timelineBaseLayer = getGraphicTlLayer(object)
	const isFullscreen = timelineBaseLayer === OGrafLayers.OGrafFullScreenLoad
	const graphicId = getOGrafGraphicId(object)
	const data = getOGrafGraphicData(object)
	const useStopCommand = !isFullscreen

	const graphicObject = literal<TimelineBlueprintExt<any>>({
		id: '',
		enable: {
			start: 0,
			duration: object.duration > 0 ? object.duration + OGRAF_CLEAR_COMMAND_DURATION : undefined,
		},
		layer: timelineBaseLayer,
		priority: 1 + (isAdlib ? 10 : 0),
		content: {
			deviceType: OGRAPH_DEVICE_TYPE,
			type: OGRAPH_CONTENT_TYPE.GRAPHIC,
			graphicId,
			playing: false,
			useStopCommand,
			data,
		},
		keyframes: [
			{
				id: '',
				enable: {
					start: 1,
				},
				content: {
					playing: true,
				},
			},
			...(object.duration > 0
				? [
						{
							id: '',
							enable: {
								start: object.duration,
							},
							content: {
								playing: false,
								useStopCommand,
							},
						},
					]
				: []),
		],
	} as any)

	return [
		graphicObject,
		...(isFullscreen && config.visionMixer.type !== VisionMixerDevice.OBS
			? createVisionMixerObjects(config, fullscreenAtemInput?.input || 0, config.casparcgLatency)
			: []),
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
