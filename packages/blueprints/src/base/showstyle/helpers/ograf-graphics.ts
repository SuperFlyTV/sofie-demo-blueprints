import {
	DefaultUserOperationsTypes,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	JSONBlobStringify,
	JSONSchema,
	PieceLifespan,
	TSR,
	UserEditingType,
} from '@sofie-automation/blueprints-integration'
import * as OGraf from 'ograf'
import { ObjectType, OGrafGraphicObject, SomeObject } from '../../../common/definitions/objects.js'
import { literal, t } from '../../../common/util.js'
import { StudioConfig } from '../../studio/helpers/config.js'
import { OGrafLayers } from '../../studio/layers.js'
import { getOutputLayerForSourceLayer, SourceLayer } from '../applyconfig/layers.js'
import { getClipPlayerInput } from './clips.js'
import { createVisionMixerObjects } from './visionMixer.js'
import { TimelineBlueprintExt } from '../../studio/customTypes.js'
import { GraphicsResult } from './graphics.js'

export function parseOGrafGraphicsFromObjects(config: StudioConfig, objects: SomeObject[]): GraphicsResult {
	const graphicsObjects: OGrafGraphicObject[] = []
	for (const o of objects) {
		if (o.objectType === ObjectType.OGrafGraphic) {
			graphicsObjects.push(o as OGrafGraphicObject)
		}
	}

	return {
		pieces: graphicsObjects.filter((o) => !o.isAdlib).map((o) => parseOGrafGraphic(config, o)),
		adLibPieces: graphicsObjects.filter((o) => Boolean(o.isAdlib)).map((o, i) => parseAdlibOGrafGraphic(config, o, i)),
	}
}

function parseOGrafGraphic(config: StudioConfig, object: OGrafGraphicObject): IBlueprintPiece {
	const sourceLayer = getSourceLayer(object)

	const piece: IBlueprintPiece = {
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
			start: object.userOverrides?.objectTime ?? object.objectTime ?? 0,
			duration: (object.userOverrides?.duration ?? object.duration > 0) ? object.duration : undefined,
		},
		prerollDuration: config.casparcgLatency,
		userEditOperations: [
			{
				type: UserEditingType.SOFIE,
				id: DefaultUserOperationsTypes.RETIME_PIECE,
				limitToCurrentPart: true,
			},
		],
	}
	if (object.attributes['ograf-manifest']?.schema) {
		piece.userEditProperties = {
			globalProperties: {
				schema: JSONBlobStringify<JSONSchema>({
					type: 'object',
					properties: {
						startTime: {
							type: 'number',
							title: 'Start Time',
						},
						duration: {
							type: 'number',
							title: 'Duration',
						},

						ografData: {
							...object.attributes['ograf-manifest'].schema,
							title: 'OGraf Data',
							$schema: 'https://ograf.ebu.io/v1/specification/json-schemas/gdd/object.json',
						} satisfies Required<OGraf.GraphicsManifest>['schema'],
					},
				}),
				currentValue: {
					startTime: object.userOverrides?.objectTime ?? object.objectTime,
					duration: object.userOverrides?.duration ?? object.duration,
					ografData: object.userOverrides?.ografData ?? object.attributes['ograf-data'],
				},
			},
		}
	}

	return piece
}

function parseAdlibOGrafGraphic(config: StudioConfig, object: OGrafGraphicObject, index: number): IBlueprintAdLibPiece {
	const piece = parseOGrafGraphic(config, object)

	const adlib: IBlueprintAdLibPiece = {
		...piece,
		_rank: index, // todo - probably some offset for ordering
		expectedDuration: object.userOverrides?.duration ?? object.duration,
	}
	return adlib
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
		case 'studio1':
			return SourceLayer.OGrafStudio1
		case 'studio2':
			return SourceLayer.OGrafStudio2
		case 'studio3':
			return SourceLayer.OGrafStudio3
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
		case 'studio1':
			return OGrafLayers.OGrafStudio1
		case 'studio2':
			return OGrafLayers.OGrafStudio2
		case 'studio3':
			return OGrafLayers.OGrafStudio3
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

				data: object.userOverrides?.ografData ?? object.attributes['ograf-data'],
				useStopCommand: true,
			},
		}),
		...(isFullscreen ? createVisionMixerObjects(config, fullscreenAtemInput?.input || 0, config.casparcgLatency) : []),
	]
}

function makeOGrafName(object: OGrafGraphicObject): string {
	const data = (object.userOverrides?.ografData ?? object.attributes['ograf-data']) || {}

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
