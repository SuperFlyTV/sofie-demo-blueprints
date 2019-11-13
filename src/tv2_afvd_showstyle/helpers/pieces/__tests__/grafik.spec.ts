import {
	DeviceType,
	TimelineContentTypeVizMSE,
	TimelineObjVIZMSEAny,
	TimelineObjVIZMSEElementInternal
} from 'timeline-state-resolver-types'
import {
	GraphicsContent,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	PieceLifespan
} from 'tv-automation-sofie-blueprints-integration'
import { literal } from '../../../../common/util'
import { defaultShowStyleConfig, defaultStudioConfig } from '../../../../tv2_afvd_showstyle/__tests__/configs'
import { CueDefinitionGrafik, CueType } from '../../../../tv2_afvd_showstyle/inewsConversion/converters/ParseCue'
import { SourceLayer } from '../../../../tv2_afvd_showstyle/layers'
import { StudioConfig } from '../../../../tv2_afvd_studio/helpers/config'
import { VizLLayer } from '../../../../tv2_afvd_studio/layers'
import { ShowStyleConfig } from '../../config'
import { EvaluateGrafik } from '../grafik'

describe('grafik piece', () => {
	test('kg bund', () => {
		const cue: CueDefinitionGrafik = {
			type: CueType.Grafik,
			template: 'bund',
			cue: 'kg',
			textFields: ['Odense', 'Copenhagen'],
			start: {
				seconds: 0
			}
		}
		const pieces: IBlueprintPiece[] = []
		const adLibPieces: IBlueprintAdLibPiece[] = []
		const partId = '0000000001'
		EvaluateGrafik(
			{
				showStyle: (defaultShowStyleConfig as unknown) as ShowStyleConfig,
				studio: (defaultStudioConfig as unknown) as StudioConfig,
				sources: [],
				mediaPlayers: []
			},
			pieces,
			adLibPieces,
			partId,
			cue,
			cue.adlib ? cue.adlib : false,
			false
		)
		expect(pieces).toEqual([
			literal<IBlueprintPiece>({
				_id: '',
				externalId: partId,
				name: 'bund - Odense - Copenhagen',
				enable: {
					start: 0,
					end: 4000
				},
				infiniteMode: PieceLifespan.Normal,
				outputLayerId: 'pgm0',
				sourceLayerId: SourceLayer.PgmGraphics,
				content: literal<GraphicsContent>({
					fileName: 'bund',
					path: 'bund',
					timelineObjects: literal<TimelineObjVIZMSEAny[]>([
						literal<TimelineObjVIZMSEElementInternal>({
							id: '',
							enable: {
								start: 0
							},
							priority: 1,
							layer: VizLLayer.VizLLayerOverlay,
							content: {
								deviceType: DeviceType.VIZMSE,
								type: TimelineContentTypeVizMSE.ELEMENT_INTERNAL,
								templateName: 'bund',
								templateData: ['Odense', 'Copenhagen'],
								channelName: 'FULL1'
							}
						})
					])
				})
			})
		])
	})

	test('adlib kg bund', () => {
		const cue: CueDefinitionGrafik = {
			type: CueType.Grafik,
			template: 'bund',
			cue: 'kg',
			textFields: ['Odense', 'Copenhagen'],
			adlib: true
		}
		const pieces: IBlueprintPiece[] = []
		const adLibPieces: IBlueprintAdLibPiece[] = []
		const partId = '0000000001'
		EvaluateGrafik(
			{
				showStyle: (defaultShowStyleConfig as unknown) as ShowStyleConfig,
				studio: (defaultStudioConfig as unknown) as StudioConfig,
				sources: [],
				mediaPlayers: []
			},
			pieces,
			adLibPieces,
			partId,
			cue,
			cue.adlib ? cue.adlib : false,
			false
		)
		expect(adLibPieces).toEqual([
			literal<IBlueprintAdLibPiece>({
				_rank: 0,
				externalId: partId,
				name: 'bund - Odense - Copenhagen',
				infiniteMode: PieceLifespan.Normal,
				outputLayerId: 'pgm0',
				sourceLayerId: SourceLayer.PgmGraphics,
				expectedDuration: 4000,
				content: literal<GraphicsContent>({
					fileName: 'bund',
					path: 'bund',
					timelineObjects: literal<TimelineObjVIZMSEAny[]>([
						literal<TimelineObjVIZMSEElementInternal>({
							id: '',
							enable: {
								start: 0
							},
							priority: 1,
							layer: VizLLayer.VizLLayerOverlay,
							content: {
								deviceType: DeviceType.VIZMSE,
								type: TimelineContentTypeVizMSE.ELEMENT_INTERNAL,
								templateName: 'bund',
								templateData: ['Odense', 'Copenhagen'],
								channelName: 'FULL1'
							}
						})
					])
				})
			})
		])
	})

	test('kg bund length', () => {
		const cue: CueDefinitionGrafik = {
			type: CueType.Grafik,
			template: 'bund',
			cue: 'kg',
			textFields: ['Odense', 'Copenhagen'],
			start: {
				seconds: 10
			}
		}
		const pieces: IBlueprintPiece[] = []
		const adLibPieces: IBlueprintAdLibPiece[] = []
		const partId = '0000000001'
		EvaluateGrafik(
			{
				showStyle: (defaultShowStyleConfig as unknown) as ShowStyleConfig,
				studio: (defaultStudioConfig as unknown) as StudioConfig,
				sources: [],
				mediaPlayers: []
			},
			pieces,
			adLibPieces,
			partId,
			cue,
			cue.adlib ? cue.adlib : false,
			false
		)
		expect(pieces).toEqual([
			literal<IBlueprintPiece>({
				_id: '',
				externalId: partId,
				name: 'bund - Odense - Copenhagen',
				enable: {
					start: 10000,
					end: 14000
				},
				infiniteMode: PieceLifespan.Normal,
				outputLayerId: 'pgm0',
				sourceLayerId: SourceLayer.PgmGraphics,
				content: literal<GraphicsContent>({
					fileName: 'bund',
					path: 'bund',
					timelineObjects: literal<TimelineObjVIZMSEAny[]>([
						literal<TimelineObjVIZMSEElementInternal>({
							id: '',
							enable: {
								start: 0
							},
							priority: 1,
							layer: VizLLayer.VizLLayerOverlay,
							content: {
								deviceType: DeviceType.VIZMSE,
								type: TimelineContentTypeVizMSE.ELEMENT_INTERNAL,
								templateName: 'bund',
								templateData: ['Odense', 'Copenhagen'],
								channelName: 'FULL1'
							}
						})
					])
				})
			})
		])
	})
})
