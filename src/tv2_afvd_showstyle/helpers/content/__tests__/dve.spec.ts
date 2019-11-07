import {
	AtemTransitionStyle,
	DeviceType,
	TimelineContentTypeAtem,
	TimelineContentTypeCasparCg,
	TimelineObjAtemME,
	TimelineObjAtemSsrc,
	TimelineObjAtemSsrcProps,
	TimelineObjCCGMedia,
	TimelineObjCCGTemplate,
	TSRTimelineObj
} from 'timeline-state-resolver-types'
import { SourceLayerType, SplitsContent } from 'tv-automation-sofie-blueprints-integration'
import _ = require('underscore')
import { SegmentContext } from '../../../../__mocks__/context'
import { literal } from '../../../../common/util'
import { casparABPlaybackConfig, defaultShowStyleConfig } from '../../../../tv2_afvd_showstyle/__tests__/configs'
import { PartContext2 } from '../../../../tv2_afvd_showstyle/getSegment'
import { CueType } from '../../../../tv2_afvd_showstyle/inewsConversion/converters/ParseCue'
import { atemNextObject } from '../../../../tv2_afvd_studio/helpers/objects'
import { AtemLLayer, CasparLLayer } from '../../../../tv2_afvd_studio/layers'
import mappingsDefaults from '../../../../tv2_afvd_studio/migrations/mappings-defaults'
import { AtemSourceIndex } from '../../../../types/atem'
import { parseConfig } from '../../config'
import { GetSisyfosTimelineObjForCamera, GetSisyfosTimelineObjForEkstern } from '../../sisyfos/sisyfos'
import { MakeContentDVE } from '../dve'

describe('DVE Content', () => {
	test('boxes', () => {
		const mockContext = new SegmentContext(
			{ _id: '', showStyleVariantId: '', externalId: '0000000001', name: 'mock-rundown' },
			mappingsDefaults
		)
		mockContext.studioConfig = casparABPlaybackConfig
		mockContext.showStyleConfig = defaultShowStyleConfig
		const partContext = new PartContext2(mockContext, '0000000001')
		const config = parseConfig(mockContext)
		const result = MakeContentDVE(
			partContext,
			config,
			'0000000001',
			{
				type: CueType.DVE,
				template: 'morbarn',
				sources: { INP1: 'KAM 1', INP2: 'LIVE 1' },
				labels: ['Odense', 'København']
			},
			{
				boxes: {
					0: {
						enabled: true,
						source: 2,
						x: -800,
						y: 25,
						size: 550,
						cropped: true,
						cropTop: 0,
						cropBottom: 0,
						cropLeft: 0,
						cropRight: 1500
					},
					1: {
						enabled: true,
						source: 1,
						x: 800,
						y: 25,
						size: 550,
						cropped: false,
						cropTop: 340,
						cropBottom: 550,
						cropLeft: 0,
						cropRight: 0
					},
					2: {
						enabled: false,
						source: 0,
						x: 0,
						y: 0,
						size: 1000,
						cropped: false,
						cropTop: 0,
						cropBottom: 0,
						cropLeft: 0,
						cropRight: 0
					},
					3: {
						enabled: false,
						source: 0,
						x: 0,
						y: 0,
						size: 1000,
						cropped: false,
						cropTop: 0,
						cropBottom: 0,
						cropLeft: 0,
						cropRight: 0
					}
				},
				index: 0,
				properties: {
					artFillSource: 30,
					artCutSource: 32,
					artOption: 1,
					artPreMultiplied: true,
					artClip: 0,
					artGain: 0,
					artInvertKey: false
				},
				border: {
					borderEnabled: true,
					borderBevel: 0,
					borderOuterWidth: 192,
					borderInnerWidth: 0,
					borderOuterSoftness: 0,
					borderInnerSoftness: 0,
					borderBevelSoftness: 0,
					borderBevelPosition: 0,
					borderHue: 736,
					borderSaturation: 0,
					borderLuma: 1000,
					borderLightSourceDirection: 0,
					borderLightSourceAltitude: 10
				}
			}
		)
		expect(partContext.getNotes()).toEqual([])
		expect(result).toEqual(
			literal<{ content: SplitsContent; valid: boolean }>({
				valid: true,
				content: {
					boxSourceConfiguration: [
						{
							studioLabel: '',
							switcherInput: 1,
							timelineObjects: [],
							type: SourceLayerType.CAMERA
						},
						{
							studioLabel: '',
							switcherInput: 1,
							timelineObjects: [],
							type: SourceLayerType.REMOTE
						}
					],
					dveConfiguration: {},
					timelineObjects: _.compact<TSRTimelineObj>([
						// setup ssrc
						literal<TimelineObjAtemSsrc>({
							id: `0000000001_DVE_ATEMSSRC`,
							enable: { start: 0 },
							priority: 1,
							layer: AtemLLayer.AtemSSrcDefault,
							content: {
								deviceType: DeviceType.ATEM,
								type: TimelineContentTypeAtem.SSRC,
								ssrc: {
									boxes: [
										{
											enabled: true,
											source: 1,
											x: -800,
											y: 25,
											size: 550,
											cropped: true,
											cropTop: 0,
											cropBottom: 0,
											cropLeft: 0,
											cropRight: 1500
										},
										{
											enabled: true,
											source: 1,
											x: 800,
											y: 25,
											size: 550,
											cropped: false,
											cropTop: 340,
											cropBottom: 550,
											cropLeft: 0,
											cropRight: 0
										}
									]
								}
							}
						}),
						literal<TimelineObjAtemSsrcProps>({
							id: `0000000001_DVE_ATEMSSRC_ART`,
							enable: { start: 10 },
							priority: 1,
							layer: AtemLLayer.AtemSSrcArt,
							content: {
								deviceType: DeviceType.ATEM,
								type: TimelineContentTypeAtem.SSRCPROPS,
								ssrcProps: {
									artFillSource: config.studio.AtemSource.SplitArtF,
									artCutSource: config.studio.AtemSource.SplitArtK,
									artOption: 1,
									artPreMultiplied: true
								}
							}
						}),

						literal<TimelineObjAtemME>({
							id: '',
							enable: { start: 80 }, // give the ssrc 2 frames to get configured
							priority: 1,
							layer: AtemLLayer.AtemMEProgram,
							content: {
								deviceType: DeviceType.ATEM,
								type: TimelineContentTypeAtem.ME,
								me: {
									input: AtemSourceIndex.SSrc,
									transition: AtemTransitionStyle.CUT
								}
							}
						}),

						literal<TimelineObjCCGTemplate>({
							id: '',
							enable: { start: 0 },
							priority: 1,
							layer: CasparLLayer.CasparCGDVETemplate,
							content: {
								deviceType: DeviceType.CASPARCG,
								type: TimelineContentTypeCasparCg.TEMPLATE,
								templateType: 'html',
								name: 'dve/locators',
								data: {
									display: {
										isPreview: false,
										displayState: 'locators'
									},
									locators: {
										style: {
											locator1: {
												x: 100,
												y: 100,
												widht: 300,
												heigt: 30
											},
											locator2: {
												x: 500,
												y: 100,
												widht: 300,
												heigt: 30
											}
										},
										content: {
											locator1: 'Odense',
											locator2: 'København'
										}
									}
								},
								useStopCommand: false
							}
						}),
						literal<TimelineObjCCGMedia>({
							id: '',
							enable: { start: 0 },
							priority: 1,
							layer: CasparLLayer.CasparCGDVEKey,
							content: {
								deviceType: DeviceType.CASPARCG,
								type: TimelineContentTypeCasparCg.MEDIA,
								file: 'loopy_key',
								mixer: {
									keyer: true
								},
								loop: true
							}
						}),
						literal<TimelineObjCCGMedia>({
							id: '',
							enable: { start: 0 },
							priority: 1,
							layer: CasparLLayer.CasparCGDVEFrame,
							content: {
								deviceType: DeviceType.CASPARCG,
								type: TimelineContentTypeCasparCg.MEDIA,
								file: 'loopy_frame',
								loop: true
							}
						}),

						...GetSisyfosTimelineObjForCamera('KAM 1', false),

						...GetSisyfosTimelineObjForEkstern('LIVE 1', false),

						atemNextObject(AtemSourceIndex.SSrc)
					])
				}
			})
		)
	})

	test('limit number', () => {
		const mockContext = new SegmentContext(
			{ _id: '', showStyleVariantId: '', externalId: '0000000001', name: 'mock-rundown' },
			mappingsDefaults
		)
		mockContext.studioConfig = casparABPlaybackConfig
		mockContext.showStyleConfig = defaultShowStyleConfig
		const partContext = new PartContext2(mockContext, '0000000001')
		const config = parseConfig(mockContext)
		const result = MakeContentDVE(
			partContext,
			config,
			'0000000001',
			{
				type: CueType.DVE,
				template: '1til2',
				sources: { INP1: 'KAM 1', INP2: 'LIVE 1' },
				labels: ['Odense', 'København']
			},
			{
				boxes: {
					0: {
						enabled: true,
						source: 2,
						x: -800,
						y: 25,
						size: 550,
						cropped: true,
						cropTop: 0,
						cropBottom: 0,
						cropLeft: 0,
						cropRight: 1500
					},
					1: {
						enabled: true,
						source: 1,
						x: 800,
						y: 25,
						size: 550,
						cropped: false,
						cropTop: 340,
						cropBottom: 550,
						cropLeft: 0,
						cropRight: 0
					},
					2: {
						enabled: false,
						source: 0,
						x: 0,
						y: 0,
						size: 1000,
						cropped: false,
						cropTop: 0,
						cropBottom: 0,
						cropLeft: 0,
						cropRight: 0
					},
					3: {
						enabled: false,
						source: 0,
						x: 0,
						y: 0,
						size: 1000,
						cropped: false,
						cropTop: 0,
						cropBottom: 0,
						cropLeft: 0,
						cropRight: 0
					}
				},
				index: 0,
				properties: {
					artFillSource: 30,
					artCutSource: 32,
					artOption: 1,
					artPreMultiplied: true,
					artClip: 0,
					artGain: 0,
					artInvertKey: false
				},
				border: {
					borderEnabled: true,
					borderBevel: 0,
					borderOuterWidth: 192,
					borderInnerWidth: 0,
					borderOuterSoftness: 0,
					borderInnerSoftness: 0,
					borderBevelSoftness: 0,
					borderBevelPosition: 0,
					borderHue: 736,
					borderSaturation: 0,
					borderLuma: 1000,
					borderLightSourceDirection: 0,
					borderLightSourceAltitude: 10
				}
			}
		)
		expect(partContext.getNotes()).toEqual([])
		expect(result).toEqual(
			literal<{ content: SplitsContent; valid: boolean }>({
				valid: true,
				content: {
					boxSourceConfiguration: [
						{
							studioLabel: '',
							switcherInput: 1,
							timelineObjects: [],
							type: SourceLayerType.REMOTE
						},
						{
							studioLabel: '',
							switcherInput: 1,
							timelineObjects: [],
							type: SourceLayerType.CAMERA
						}
					],
					dveConfiguration: {},
					timelineObjects: _.compact<TSRTimelineObj>([
						// setup ssrc
						literal<TimelineObjAtemSsrc>({
							id: `0000000001_DVE_ATEMSSRC`,
							enable: { start: 0 },
							priority: 1,
							layer: AtemLLayer.AtemSSrcDefault,
							content: {
								deviceType: DeviceType.ATEM,
								type: TimelineContentTypeAtem.SSRC,
								ssrc: {
									boxes: [
										{
											enabled: true,
											source: 1,
											x: -800,
											y: 25,
											size: 550,
											cropped: true,
											cropTop: 0,
											cropBottom: 0,
											cropLeft: 0,
											cropRight: 1500
										},
										{
											enabled: true,
											source: 1,
											x: 800,
											y: 25,
											size: 550,
											cropped: false,
											cropTop: 340,
											cropBottom: 550,
											cropLeft: 0,
											cropRight: 0
										}
									]
								}
							}
						}),
						literal<TimelineObjAtemSsrcProps>({
							id: `0000000001_DVE_ATEMSSRC_ART`,
							enable: { start: 10 },
							priority: 1,
							layer: AtemLLayer.AtemSSrcArt,
							content: {
								deviceType: DeviceType.ATEM,
								type: TimelineContentTypeAtem.SSRCPROPS,
								ssrcProps: {
									artFillSource: config.studio.AtemSource.SplitArtF,
									artCutSource: config.studio.AtemSource.SplitArtK,
									artOption: 1,
									artPreMultiplied: true
								}
							}
						}),

						literal<TimelineObjAtemME>({
							id: '',
							enable: { start: 80 }, // give the ssrc 2 frames to get configured
							priority: 1,
							layer: AtemLLayer.AtemMEProgram,
							content: {
								deviceType: DeviceType.ATEM,
								type: TimelineContentTypeAtem.ME,
								me: {
									input: AtemSourceIndex.SSrc,
									transition: AtemTransitionStyle.CUT
								}
							}
						}),

						literal<TimelineObjCCGTemplate>({
							id: '',
							enable: { start: 0 },
							priority: 1,
							layer: CasparLLayer.CasparCGDVETemplate,
							content: {
								deviceType: DeviceType.CASPARCG,
								type: TimelineContentTypeCasparCg.TEMPLATE,
								templateType: 'html',
								name: 'dve/locators',
								data: {
									display: {
										isPreview: false,
										displayState: 'locators'
									},
									locators: {
										style: {
											locator1: {
												x: 100,
												y: 100,
												widht: 300,
												heigt: 30
											},
											locator2: {
												x: 500,
												y: 100,
												widht: 300,
												heigt: 30
											}
										},
										content: {
											locator1: 'Odense',
											locator2: 'København'
										}
									}
								},
								useStopCommand: false
							}
						}),
						literal<TimelineObjCCGMedia>({
							id: '',
							enable: { start: 0 },
							priority: 1,
							layer: CasparLLayer.CasparCGDVEKey,
							content: {
								deviceType: DeviceType.CASPARCG,
								type: TimelineContentTypeCasparCg.MEDIA,
								file: 'loopy_key',
								mixer: {
									keyer: true
								},
								loop: true
							}
						}),
						literal<TimelineObjCCGMedia>({
							id: '',
							enable: { start: 0 },
							priority: 1,
							layer: CasparLLayer.CasparCGDVEFrame,
							content: {
								deviceType: DeviceType.CASPARCG,
								type: TimelineContentTypeCasparCg.MEDIA,
								file: 'loopy_frame',
								loop: true
							}
						}),

						...GetSisyfosTimelineObjForEkstern('LIVE 1', false),

						...GetSisyfosTimelineObjForCamera('KAM 1', false),

						atemNextObject(AtemSourceIndex.SSrc)
					])
				}
			})
		)
	})
})
