import { BlueprintConfigCoreConfig, LookaheadMode, PieceLifespan, TSR } from '@sofie-automation/blueprints-integration'
import { describe, it, expect } from 'vitest'
// eslint-disable-next-line vitest/no-mocks-import
import { CommonContext, RundownContext, ShowStyleContext } from '../__mocks__/context.js'
import { ObjectType, type GraphicObject } from '../common/definitions/objects.js'
import { PartContext } from '../common/context.js'
import { applyConfig } from '../base/studio/applyConfig/index.js'
import { OBSLayers, OGrafLayers } from '../base/studio/layers.js'
import {
	getOBSInputAudioABPendingLayer,
	getOBSCurrentSceneLookaheadLayer,
	getOBSInputMediaABPendingLayer,
	getOBSInputSettingsABPendingLayer,
	getOBSInputAudioLayer,
	getOBSInputMediaLayer,
	getOBSInputSettingsLayer,
	getOBSSceneItemLayer,
} from '../base/studio/applyConfig/mappings/obs.js'
import { generateCameraPart } from '../base/showstyle/part-adapters/camera.js'
import { generateDVEPart } from '../base/showstyle/part-adapters/dve.js'
import { generateGfxPart } from '../base/showstyle/part-adapters/gfx.js'
import { generateOpenerPart } from '../base/showstyle/part-adapters/titles.js'
import { generateVTPart } from '../base/showstyle/part-adapters/vt.js'
import { getAbResolverConfiguration } from '../base/showstyle/getAbResolverConfiguration.js'
import { parseGraphicsFromObjects } from '../base/showstyle/helpers/graphics.js'
import { parseOGrafGraphicsFromObjects } from '../base/showstyle/helpers/ograf-graphics.js'
import { PartInfo, PartType } from '../base/showstyle/definitions/index.js'
import { SourceType } from '../base/studio/helpers/config.js'
import { DemoOBSStudioConfig } from '../main/studio/configs/demo.js'
import { getBaseline } from '../base/showstyle/rundown/baseline.js'
import { getBaseline as getStudioBaseline } from '../base/studio/getBaseline.js'
import { SourceLayer } from '../base/showstyle/applyconfig/layers.js'

const OGRAPH_DEVICE_TYPE_FOR_TEST = ((TSR.DeviceType as any).OGRAF ?? 'OGRAF') as TSR.DeviceType

function createPartContext(showStyleConfig = { dvePresets: {} }): PartContext {
	const context = new RundownContext({ _id: 'rundown0', name: 'Rundown' } as any, {}, 'test')
	context.studioConfig = { studio: DemoOBSStudioConfig }
	context.showStyleConfig = showStyleConfig
	return new PartContext(context, 'part0')
}

describe('OBS standalone blueprints', () => {
	it('generates OBS devices and mappings without CasparCG or Sisyfos', () => {
		const result = applyConfig(new CommonContext('apply'), DemoOBSStudioConfig, {} as BlueprintConfigCoreConfig)

		expect(result.playoutDevices.obs0?.options.type).toBe(TSR.DeviceType.OBS)
		expect(result.playoutDevices.casparcg0).toBeUndefined()
		expect(result.playoutDevices.sisyfos0).toBeUndefined()
		expect(result.mappings[OBSLayers.OBSCurrentScene]?.device).toBe(TSR.DeviceType.OBS)
		expect(result.mappings[OBSLayers.OBSCurrentScene]?.lookahead).toBe(LookaheadMode.PRELOAD)
		expect(result.mappings[OBSLayers.OBSCurrentScene]?.lookaheadDepth).toBe(1)
		expect(result.mappings[OBSLayers.OBSCurrentScene]?.lookaheadMaxSearchDistance).toBe(1)
		expect(result.mappings[getOBSCurrentSceneLookaheadLayer()]?.options).toMatchObject({
			mappingType: TSR.MappingObsType.CurrentScene,
		})
		expect(result.mappings[getOBSCurrentSceneLookaheadLayer()]?.lookahead).toBe(LookaheadMode.NONE)
		expect(result.mappings[OBSLayers.OBSDownstreamKeyer]?.options).toMatchObject({
			mappingType: TSR.MappingObsType.DownstreamKeyer,
		})
		expect(result.mappings[getOBSInputSettingsABPendingLayer()]?.lookahead).toBe(LookaheadMode.WHEN_CLEAR)
		expect(result.mappings[getOBSInputSettingsABPendingLayer()]?.lookaheadDepth).toBe(2)
		expect(result.mappings[getOBSInputMediaABPendingLayer()]?.lookahead).toBe(LookaheadMode.WHEN_CLEAR)
		expect(result.mappings[getOBSInputMediaABPendingLayer()]?.lookaheadDepth).toBe(2)
		expect(result.mappings[getOBSInputMediaLayer('mediaplayer1')]?.options).toMatchObject({
			mappingType: TSR.MappingObsType.InputMedia,
			input: 'Player 1',
		})
		expect(result.mappings[getOBSInputMediaLayer('mediaplayer2')]?.options).toMatchObject({
			mappingType: TSR.MappingObsType.InputMedia,
			input: 'Player 2',
		})
		expect(result.mappings[getOBSInputMediaLayer('mediaplayer3')]?.options).toMatchObject({
			mappingType: TSR.MappingObsType.InputMedia,
			input: 'Player 3',
		})
		expect(DemoOBSStudioConfig.obsAbMediaPlayerSourceIds).toEqual(['mediaplayer1', 'mediaplayer2'])
		expect(DemoOBSStudioConfig.obsEffectsMediaPlayerSourceId).toBe('mediaplayer3')
		const mediaPlayer1Input = (result.mappings[getOBSInputMediaLayer('mediaplayer1')]?.options as any).input
		const mediaPlayer2Input = (result.mappings[getOBSInputMediaLayer('mediaplayer2')]?.options as any).input
		expect(mediaPlayer1Input).not.toBe(mediaPlayer2Input)
		expect(result.mappings[getOBSInputAudioLayer('camera1')]).toBeUndefined()
		expect(result.mappings[getOBSSceneItemLayer('lowerThird')]?.options).toMatchObject({
			mappingType: TSR.MappingObsType.SceneItem,
			sceneName: 'LAYER Graphics',
			source: 'Lower Third',
		})
	})

	it('generates OBS scene and audio timeline objects for camera parts', () => {
		const part = generateCameraPart(createPartContext(), {
			type: PartType.Camera,
			rawType: 'camera',
			rawTitle: 'Camera 1',
			info: PartInfo.NORMAL,
			payload: {
				externalId: 'cam1',
				duration: 1000,
				name: 'Camera 1',
				input: { type: SourceType.Camera, id: 1 },
			},
			objects: [],
		})

		const timelineObjects = part.pieces[0].content.timelineObjects
		expect(timelineObjects).toContainEqual(
			expect.objectContaining({
				layer: OBSLayers.OBSCurrentScene,
				content: expect.objectContaining({
					deviceType: TSR.DeviceType.OBS,
					type: TSR.TimelineContentTypeOBS.CURRENT_SCENE,
					sceneName: 'CAM 1',
				}),
			})
		)
		expect(timelineObjects.some((o) => o.layer === getOBSInputAudioLayer('camera1'))).toBe(false)
	})

	it('generates OBS media playback timeline objects for VT parts', () => {
		const part = generateVTPart(createPartContext(), {
			type: PartType.VT,
			rawType: 'vt',
			rawTitle: 'VT',
			info: PartInfo.NORMAL,
			payload: {
				externalId: 'vt1',
				duration: 1000,
				name: 'VT',
				clipProps: { fileName: 'clip.mp4', sourceDuration: 1000 },
			},
			objects: [],
		})

		const timelineObjects = part.pieces[0].content.timelineObjects
		expect(part.pieces[0].abSessions).toContainEqual({
			sessionName: 'vt1',
			poolName: 'clip',
		})
		expect(timelineObjects).toContainEqual(
			expect.objectContaining({
				layer: getOBSInputSettingsABPendingLayer(),
				content: expect.objectContaining({
					deviceType: TSR.DeviceType.OBS,
					type: TSR.TimelineContentTypeOBS.INPUT_SETTINGS,
					sourceSettings: expect.objectContaining({
						is_local_file: true,
						local_file: 'clip.mp4',
					}),
				}),
				abSessions: [{ sessionName: 'vt1', poolName: 'clip' }],
			})
		)
		const mediaObject = timelineObjects.find((o) => o.layer === getOBSInputMediaABPendingLayer())
		expect(mediaObject).toMatchObject({
			content: expect.objectContaining({
				deviceType: TSR.DeviceType.OBS,
				type: TSR.TimelineContentTypeOBS.INPUT_MEDIA,
				seek: 0,
				state: 'paused',
			}),
			keyframes: [
				expect.objectContaining({
					enable: { start: 0 },
					content: { state: 'playing' },
				}),
			],
			abSessions: [{ sessionName: 'vt1', poolName: 'clip' }],
		})
		expect(mediaObject?.keyframes?.[0]).not.toHaveProperty('preserveForLookahead')
		expect(timelineObjects).toContainEqual(
			expect.objectContaining({
				layer: getOBSInputAudioABPendingLayer(),
				content: expect.objectContaining({
					deviceType: TSR.DeviceType.OBS,
					type: TSR.TimelineContentTypeOBS.INPUT_AUDIO,
					mute: false,
				}),
				abSessions: [{ sessionName: 'vt1', poolName: 'clip' }],
			})
		)
	})

	it('generates OBS titles opener media timeline objects on fixed Player 3', () => {
		const part = generateOpenerPart(createPartContext(), {
			type: PartType.Titles,
			rawType: 'titles',
			rawTitle: 'Titles',
			info: PartInfo.NORMAL,
			payload: {
				externalId: 'titles1',
				duration: 1000,
				name: 'Titles',
				variant: 'default',
			},
			objects: [],
		})

		const timelineObjects = part.pieces[0].content.timelineObjects
		expect(part.pieces[0].abSessions).toBeUndefined()
		expect(timelineObjects).toContainEqual(
			expect.objectContaining({
				layer: getOBSInputSettingsLayer('mediaplayer3'),
				content: expect.objectContaining({
					deviceType: TSR.DeviceType.OBS,
					type: TSR.TimelineContentTypeOBS.INPUT_SETTINGS,
				}),
			})
		)
		const mediaObject = timelineObjects.find((o) => o.layer === getOBSInputMediaLayer('mediaplayer3'))
		expect(mediaObject).toMatchObject({
			content: expect.objectContaining({
				deviceType: TSR.DeviceType.OBS,
				type: TSR.TimelineContentTypeOBS.INPUT_MEDIA,
				seek: 0,
				state: 'paused',
			}),
			keyframes: [
				expect.objectContaining({
					enable: { start: 0 },
					content: { state: 'playing' },
				}),
			],
		})
		expect(mediaObject).not.toHaveProperty('abSessions')
		expect(mediaObject?.keyframes?.[0]).not.toHaveProperty('preserveForLookahead')
		expect(timelineObjects.some((o) => o.layer === getOBSInputAudioABPendingLayer())).toBe(false)
		expect(timelineObjects.some((o) => o.layer === OBSLayers.OBSCurrentScene)).toBe(false)
		expect(timelineObjects.some((o) => o.layer === OBSLayers.OBSDownstreamKeyer)).toBe(false)
	})

	it('generates OBS shot-scene timeline objects for DVE parts', () => {
		const part = generateDVEPart(
			createPartContext({
				dvePresets: {
					twoBox: {
						name: 'twoBox',
						boxes: 2,
						preset: JSON.stringify({
							boxes: [{ enabled: true }, { enabled: true }],
							properties: {},
							border: {},
						}),
					},
				},
			}),
			{
				type: PartType.DVE,
				rawType: 'dve',
				rawTitle: 'DVE',
				info: PartInfo.NORMAL,
				payload: {
					externalId: 'dve1',
					duration: 1000,
					name: 'DVE',
					layout: 'twoBox',
					inputs: [
						{ type: SourceType.Camera, id: 1 },
						{ type: SourceType.Remote, id: 1 },
					],
				},
				objects: [],
			}
		)

		const timelineObjects = part.pieces[0].content.timelineObjects
		expect(timelineObjects).toContainEqual(
			expect.objectContaining({
				layer: OBSLayers.OBSCurrentScene,
				content: expect.objectContaining({
					deviceType: TSR.DeviceType.OBS,
					type: TSR.TimelineContentTypeOBS.CURRENT_SCENE,
					sceneName: 'DVE 2BOX',
				}),
			})
		)
	})

	it('generates OBS scene-item timeline objects for global graphics', () => {
		const graphics = parseGraphicsFromObjects(DemoOBSStudioConfig, [
			{
				id: 'gfx1',
				objectType: ObjectType.Graphic,
				objectTime: 0,
				duration: 1000,
				clipName: 'lower third',
				attributes: {
					name: 'Name',
					description: 'Description',
					text: 'Text',
				},
			},
		])

		const timelineObjects = graphics.pieces[0].content.timelineObjects
		expect(timelineObjects).toContainEqual(
			expect.objectContaining({
				layer: getOBSSceneItemLayer('lowerThird'),
				content: expect.objectContaining({
					deviceType: TSR.DeviceType.OBS,
					type: TSR.TimelineContentTypeOBS.SCENE_ITEM,
					on: true,
				}),
			})
		)
	})

	it('keeps timed OGraf fullscreen pieces Part-scoped so they clear on Part end', () => {
		const graphics = parseOGrafGraphicsFromObjects(DemoOBSStudioConfig, [
			{
				id: 'ograf-fullscreen',
				objectType: ObjectType.Graphic,
				objectTime: 0,
				duration: 5000,
				clipName: 'gfx/fullscreen',
				attributes: {
					name: 'Fullscreen',
					description: 'Clear me',
					text: 'Fullscreen text',
				},
			},
		])

		const piece = graphics.pieces[0]
		const graphicObject = piece.content.timelineObjects.find((o) => o.layer === OGrafLayers.OGrafFullScreenLoad)

		expect(piece.sourceLayerId).toBe(SourceLayer.OGrafFullScreen)
		expect(piece.lifespan).toBe(PieceLifespan.WithinPart)
		expect(piece.enable).toMatchObject({
			start: 0,
			duration: 6000,
		})
		expect(graphicObject).toMatchObject({
			layer: OGrafLayers.OGrafFullScreenLoad,
			enable: {
				start: 0,
				duration: 6000,
			},
			content: expect.objectContaining({
				graphicId: 'demo-blueprint-fullscreen',
				playing: false,
				useStopCommand: false,
			}),
			keyframes: expect.arrayContaining([
				expect.objectContaining({
					enable: { start: 1 },
					content: { playing: true },
				}),
				expect.objectContaining({
					enable: { start: 5000 },
					content: { playing: false, useStopCommand: false },
				}),
			]),
		})
		expect(piece.content.timelineObjects.some((o) => (o.content as any)?.deviceType === TSR.DeviceType.OBS)).toBe(false)
	})

	it('maps legacy L3D graphics to one OGraf object with play and stop keyframes', () => {
		const graphics = parseOGrafGraphicsFromObjects(DemoOBSStudioConfig, [
			{
				id: 'l3d1',
				objectType: ObjectType.Graphic,
				objectTime: 0,
				duration: 5000,
				clipName: 'gfx/l3d',
				attributes: {
					name: 'Ada',
					description: 'Engineer',
					f2: 'Grace',
					f3: 'Producer',
				},
			},
		])

		const piece = graphics.pieces[0]
		const timelineObjects = piece.content.timelineObjects

		expect(piece.sourceLayerId).toBe(SourceLayer.OGrafOverlay1)
		expect(piece.lifespan).toBe(PieceLifespan.OutOnSegmentEnd)
		expect(piece.enable).toMatchObject({
			start: 0,
			duration: 6000,
		})
		expect(timelineObjects).toHaveLength(1)
		expect(timelineObjects[0]).toMatchObject({
			layer: OGrafLayers.OGrafOverlay1Load,
			content: expect.objectContaining({
				graphicId: 'demo-blueprint-l3d',
				playing: false,
				useStopCommand: true,
				data: {
					name: 'Ada',
					description: 'Engineer',
					f2: 'Grace',
					f3: 'Producer',
				},
			}),
			keyframes: expect.arrayContaining([
				expect.objectContaining({
					enable: { start: 1 },
					content: { playing: true },
				}),
				expect.objectContaining({
					enable: { start: 5000 },
					content: { playing: false, useStopCommand: true },
				}),
			]),
		})
	})

	it('maps legacy Strap graphics to the OGraf overlay 2 render target', () => {
		const graphics = parseOGrafGraphicsFromObjects(DemoOBSStudioConfig, [
			{
				id: 'strap1',
				objectType: ObjectType.Graphic,
				objectTime: 0,
				duration: 5000,
				clipName: 'gfx/strap',
				attributes: {
					name: 'Strap',
					description: '',
					location: 'Oslo',
					text: 'Live',
				},
			},
		])

		const piece = graphics.pieces[0]
		expect(piece.sourceLayerId).toBe(SourceLayer.OGrafOverlay2)
		expect(piece.content.timelineObjects).toHaveLength(1)
		expect(piece.content.timelineObjects[0]).toMatchObject({
			layer: OGrafLayers.OGrafOverlay2Load,
			content: expect.objectContaining({
				graphicId: 'demo-blueprint-strap',
				playing: false,
				useStopCommand: true,
				data: expect.objectContaining({
					location: 'Oslo',
					text: 'Live',
				}),
			}),
		})
	})

	it('does not duplicate the primary OGraf graphic in GFX parts', () => {
		const graphic = {
			id: 'gfx-primary',
			objectType: ObjectType.Graphic,
			objectTime: 0,
			duration: 5000,
			clipName: 'gfx/l3d',
			attributes: {
				name: 'Ada',
				description: 'Engineer',
				f2: 'Grace',
				f3: 'Producer',
			},
		} as GraphicObject

		const part = generateGfxPart(createPartContext(), {
			type: PartType.GFX,
			rawType: 'gfx',
			rawTitle: 'L3D',
			info: PartInfo.NORMAL,
			payload: {
				externalId: 'gfx-part',
				duration: 5000,
				name: 'L3D',
				graphic,
			},
			objects: [graphic],
		})

		const ografObjects = part.pieces.flatMap((piece) =>
			piece.content.timelineObjects.filter(
				(object) => (object.content as any)?.deviceType === OGRAPH_DEVICE_TYPE_FOR_TEST
			)
		)

		expect(ografObjects).toHaveLength(1)
		expect(ografObjects[0]).toMatchObject({
			layer: OGrafLayers.OGrafOverlay1Load,
			content: expect.objectContaining({ graphicId: 'demo-blueprint-l3d' }),
		})
	})

	it('generates OBS media player baseline without controlling downstream keyer', () => {
		const context = new ShowStyleContext('baseline', {})
		context.studioConfig = { studio: DemoOBSStudioConfig }
		context.showStyleConfig = { dvePresets: {} }

		const baseline = getBaseline(context as any)

		expect(baseline.timelineObjects).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					layer: getOBSInputMediaLayer('mediaplayer1'),
					content: expect.objectContaining({
						deviceType: TSR.DeviceType.OBS,
						type: TSR.TimelineContentTypeOBS.INPUT_MEDIA,
						state: 'stopped',
						seek: 0,
					}),
					priority: 0,
				}),
				expect.objectContaining({
					layer: getOBSInputMediaLayer('mediaplayer2'),
					content: expect.objectContaining({
						deviceType: TSR.DeviceType.OBS,
						type: TSR.TimelineContentTypeOBS.INPUT_MEDIA,
						state: 'stopped',
						seek: 0,
					}),
					priority: 0,
				}),
				expect.objectContaining({
					layer: getOBSInputMediaLayer('mediaplayer3'),
					content: expect.objectContaining({
						deviceType: TSR.DeviceType.OBS,
						type: TSR.TimelineContentTypeOBS.INPUT_MEDIA,
						state: 'stopped',
						seek: 0,
					}),
					priority: 0,
				}),
				expect.objectContaining({
					layer: getOBSSceneItemLayer('fullscreen'),
					content: expect.objectContaining({
						deviceType: TSR.DeviceType.OBS,
						type: TSR.TimelineContentTypeOBS.SCENE_ITEM,
						on: false,
					}),
					priority: 0,
				}),
			])
		)
		expect(baseline.timelineObjects.some((o) => o.layer === OBSLayers.OBSDownstreamKeyer)).toBe(false)
	})

	it('does not include OBS downstream keyer in studio baseline', () => {
		const baseline = getStudioBaseline({
			getStudioConfig: () => ({ studio: DemoOBSStudioConfig }),
			logError: () => undefined,
		} as any)

		expect(baseline.timelineObjects.some((o) => o.layer === OBSLayers.OBSDownstreamKeyer)).toBe(false)
	})

	it('adds AB keyframes to OBS current scene objects for media-player scene switching', () => {
		const part = generateVTPart(createPartContext(), {
			type: PartType.VT,
			rawType: 'vt',
			rawTitle: 'VT',
			info: PartInfo.NORMAL,
			payload: {
				externalId: 'vt-keyframe',
				duration: 1000,
				name: 'VT Keyframe',
				clipProps: { fileName: 'clip.mp4', sourceDuration: 1000 },
			},
			objects: [],
		})

		const sceneObject = part.pieces[0].content.timelineObjects.find((o) => o.layer === OBSLayers.OBSCurrentScene)
		expect(sceneObject).toBeDefined()
		expect(sceneObject?.keyframes).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					abSession: {
						poolName: 'clip',
						playerId: 'mediaplayer1',
					},
					disabled: true,
					preserveForLookahead: true,
					content: expect.objectContaining({ sceneName: DemoOBSStudioConfig.obsSources.mediaplayer1.sceneName }),
				}),
				expect.objectContaining({
					abSession: {
						poolName: 'clip',
						playerId: 'mediaplayer2',
					},
					disabled: true,
					preserveForLookahead: true,
					content: expect.objectContaining({ sceneName: DemoOBSStudioConfig.obsSources.mediaplayer2.sceneName }),
				}),
			])
		)
	})

	it('configures OBS AB resolver pools from media-player sources', () => {
		const context = new ShowStyleContext('ab-resolver', {})
		context.studioConfig = { studio: DemoOBSStudioConfig }
		context.showStyleConfig = { dvePresets: {} }

		const config = getAbResolverConfiguration(context as any)

		expect(config.pools.clip).toEqual([{ playerId: 'mediaplayer1' }, { playerId: 'mediaplayer2' }])
		expect(config.pools.clip).not.toContainEqual({ playerId: 'mediaplayer3' })
		expect(config.timelineObjectLayerChangeRules?.[getOBSInputSettingsABPendingLayer()]).toMatchObject({
			acceptedPoolNames: ['clip'],
			allowsLookahead: true,
		})
		expect(config.timelineObjectLayerChangeRules?.[getOBSInputMediaABPendingLayer()]).toMatchObject({
			acceptedPoolNames: ['clip'],
			allowsLookahead: true,
		})
		expect(config.customApplyToObject).toBeUndefined()
	})

	it('keeps OBS lookahead media paused by relying on the non-preserved play keyframe', () => {
		const timelineObject = {
			id: 'lookahead-media',
			enable: { while: 1 },
			layer: getOBSInputMediaLayer('mediaplayer2'),
			lookaheadForLayer: getOBSInputMediaLayer('mediaplayer2'),
			isLookahead: true,
			content: {
				deviceType: TSR.DeviceType.OBS,
				type: TSR.TimelineContentTypeOBS.INPUT_MEDIA,
				seek: 0,
				state: 'paused',
			},
			keyframes: [
				{
					id: 'should-be-dropped',
					enable: { start: 0 },
					content: { state: 'playing' },
				},
			],
			priority: 0.1,
		} as any

		expect(timelineObject.isLookahead).toBe(true)
		expect(timelineObject.lookaheadForLayer).toBe(getOBSInputMediaLayer('mediaplayer2'))
		expect(timelineObject.keyframes[0].preserveForLookahead).toBeUndefined()
		expect(timelineObject.content).toMatchObject({
			type: TSR.TimelineContentTypeOBS.INPUT_MEDIA,
			state: 'paused',
			seek: 0,
		})
	})

	it('generates OBS browser source INPUT_SETTINGS and scene switch for fullscreen graphics with URLs', () => {
		const context = new ShowStyleContext('test-gfx', {})
		;(context as any).studioConfig = { studio: DemoOBSStudioConfig }
		;(context as any).showStyleConfig = { dvePresets: {} }

		const graphicWithUrl = {
			objectType: ObjectType.Graphic,
			id: 'gfx-fullscreen-url',
			rawType: 'graphic',
			clipName: 'fullscreen image',
			objectTime: 0,
			duration: 5000,
			isAdlib: false,
			attributes: {
				name: 'Fullscreen Image',
				description: 'HTTP image',
				text: '',
				url: 'https://example.com/fullscreen.jpg',
			},
		} as GraphicObject

		const result = parseGraphicsFromObjects((context as any).studioConfig.studio, [graphicWithUrl])

		const piece = result.pieces[0]
		expect(piece).toBeDefined()

		const timelineObjects = piece?.content.timelineObjects || []
		const inputSettingsObj = timelineObjects.find(
			(o) => (o.content as any)?.type === TSR.TimelineContentTypeOBS.INPUT_SETTINGS
		)
		const currentSceneObj = timelineObjects.find(
			(o) => (o.content as any)?.type === TSR.TimelineContentTypeOBS.CURRENT_SCENE
		)

		expect(inputSettingsObj).toBeDefined()
		expect(inputSettingsObj?.content).toMatchObject({
			deviceType: TSR.DeviceType.OBS,
			type: TSR.TimelineContentTypeOBS.INPUT_SETTINGS,
			sourceType: 'browser_source',
			sourceSettings: expect.objectContaining({
				url: 'https://example.com/fullscreen.jpg',
			}),
		})

		expect(currentSceneObj).toBeDefined()
		expect(currentSceneObj?.content).toMatchObject({
			deviceType: TSR.DeviceType.OBS,
			type: TSR.TimelineContentTypeOBS.CURRENT_SCENE,
			sceneName: 'Fullscreen GFX',
		})
	})
})
