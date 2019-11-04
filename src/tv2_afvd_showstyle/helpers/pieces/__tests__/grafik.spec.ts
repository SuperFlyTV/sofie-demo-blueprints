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
import { CueDefinitionGrafik, CueType } from '../../../../tv2_afvd_showstyle/inewsConversion/converters/ParseCue'
import { SourceLayer } from '../../../../tv2_afvd_showstyle/layers'
import { VizLLayer } from '../../../../tv2_afvd_studio/layers'
import { EvaluateGrafik } from '../grafik'

describe('grafik piece', () => {
	test('kg bund', () => {
		const cue: CueDefinitionGrafik = {
			type: CueType.Grafik,
			template: 'bund',
			textFields: ['Odense', 'Copenhagen'],
			start: {
				seconds: 0
			}
		}
		const pieces: IBlueprintPiece[] = []
		const adLibPieces: IBlueprintAdLibPiece[] = []
		const partId = '0000000001'
		EvaluateGrafik(pieces, adLibPieces, partId, cue)
		expect(pieces).toEqual([
			literal<IBlueprintPiece>({
				_id: '',
				externalId: partId,
				name: 'bund - Odense - Copenhagen',
				enable: {
					start: 0
				},
				infiniteMode: PieceLifespan.OutOnNextPart,
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
								templateData: ['Odense', 'Copenhagen']
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
			textFields: ['Odense', 'Copenhagen'],
			adlib: true
		}
		const pieces: IBlueprintPiece[] = []
		const adLibPieces: IBlueprintAdLibPiece[] = []
		const partId = '0000000001'
		EvaluateGrafik(pieces, adLibPieces, partId, cue, cue.adlib)
		expect(adLibPieces).toEqual([
			literal<IBlueprintAdLibPiece>({
				_rank: 0,
				externalId: partId,
				name: 'bund - Odense - Copenhagen',
				infiniteMode: PieceLifespan.OutOnNextPart,
				outputLayerId: 'pgm0',
				sourceLayerId: SourceLayer.PgmGraphics,
				expectedDuration: 0,
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
								templateData: ['Odense', 'Copenhagen']
							}
						})
					])
				})
			})
		])
	})
})