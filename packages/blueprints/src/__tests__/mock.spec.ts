import { BlueprintConfigCoreConfig, TSR } from '@sofie-automation/blueprints-integration'
import { describe, it, expect } from 'vitest'
// eslint-disable-next-line vitest/no-mocks-import
import { CommonContext, RundownContext, ShowStyleContext } from '../__mocks__/context.js'
import { ObjectType, type GraphicObject } from '../common/definitions/objects.js'
import { PartContext } from '../common/context.js'
import { applyConfig } from '../base/studio/applyConfig/index.js'
import { OBSLayers } from '../base/studio/layers.js'
import {
	getOBSInputAudioLayer,
	getOBSInputSettingsLayer,
	getOBSInputMediaLayer,
	getOBSSceneItemLayer,
} from '../base/studio/applyConfig/mappings/obs.js'
import { generateCameraPart } from '../base/showstyle/part-adapters/camera.js'
import { generateDVEPart } from '../base/showstyle/part-adapters/dve.js'
import { generateOpenerPart } from '../base/showstyle/part-adapters/titles.js'
import { generateVTPart } from '../base/showstyle/part-adapters/vt.js'
import { parseGraphicsFromObjects } from '../base/showstyle/helpers/graphics.js'
import { PartInfo, PartType } from '../base/showstyle/definitions/index.js'
import { SourceType } from '../base/studio/helpers/config.js'
import { DemoOBSStudioConfig } from '../main/studio/configs/demo.js'
import { getBaseline } from '../base/showstyle/rundown/baseline.js'
import { getBaseline as getStudioBaseline } from '../base/studio/getBaseline.js'

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
		expect(result.mappings[OBSLayers.OBSDownstreamKeyer]?.options).toMatchObject({
			mappingType: TSR.MappingObsType.DownstreamKeyer,
		})
		expect(result.mappings[getOBSInputMediaLayer('mediaplayer1')]?.options).toMatchObject({
			mappingType: TSR.MappingObsType.InputMedia,
			input: 'Media',
		})
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
		expect(timelineObjects).toContainEqual(
			expect.objectContaining({
				layer: getOBSInputSettingsLayer('mediaplayer1'),
				content: expect.objectContaining({
					deviceType: TSR.DeviceType.OBS,
					type: TSR.TimelineContentTypeOBS.INPUT_SETTINGS,
					sourceSettings: expect.objectContaining({
						is_local_file: true,
						local_file: 'clip.mp4',
					}),
				}),
			})
		)
		expect(timelineObjects).toContainEqual(
			expect.objectContaining({
				layer: getOBSInputMediaLayer('mediaplayer1'),
				content: expect.objectContaining({
					deviceType: TSR.DeviceType.OBS,
					type: TSR.TimelineContentTypeOBS.INPUT_MEDIA,
					state: 'playing',
				}),
			})
		)
		expect(timelineObjects).toContainEqual(
			expect.objectContaining({
				layer: getOBSInputAudioLayer('mediaplayer1'),
				content: expect.objectContaining({
					deviceType: TSR.DeviceType.OBS,
					type: TSR.TimelineContentTypeOBS.INPUT_AUDIO,
					mute: false,
				}),
			})
		)
	})

	it('generates OBS titles opener media timeline objects on mediaplayer1', () => {
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
		expect(timelineObjects).toContainEqual(
			expect.objectContaining({
				layer: getOBSInputSettingsLayer('mediaplayer1'),
				content: expect.objectContaining({
					deviceType: TSR.DeviceType.OBS,
					type: TSR.TimelineContentTypeOBS.INPUT_SETTINGS,
				}),
			})
		)
		expect(timelineObjects).toContainEqual(
			expect.objectContaining({
				layer: getOBSInputMediaLayer('mediaplayer1'),
				content: expect.objectContaining({
					deviceType: TSR.DeviceType.OBS,
					type: TSR.TimelineContentTypeOBS.INPUT_MEDIA,
					state: 'playing',
				}),
			})
		)
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

	it('generates OBS downstream keyer baseline object for graphics scene', () => {
		const context = new ShowStyleContext('baseline', {})
		context.studioConfig = { studio: DemoOBSStudioConfig }
		context.showStyleConfig = { dvePresets: {} }

		const baseline = getBaseline(context as any)

		expect(baseline.timelineObjects).toContainEqual(
			expect.objectContaining({
				layer: OBSLayers.OBSDownstreamKeyer,
				content: expect.objectContaining({
					deviceType: TSR.DeviceType.OBS,
					type: TSR.TimelineContentTypeOBS.DOWNSTREAM_KEYER,
					sceneName: 'GFX',
				}),
			})
		)
	})

	it('does not include OBS downstream keyer in studio baseline', () => {
		const baseline = getStudioBaseline({
			getStudioConfig: () => ({ studio: DemoOBSStudioConfig }),
			logError: () => undefined,
		} as any)

		expect(baseline.timelineObjects.some((o) => o.layer === OBSLayers.OBSDownstreamKeyer)).toBe(false)
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
