import {
	DeviceType,
	TimelineContentTypeSisyfos,
	TimelineContentTypeVizMSE,
	TimelineObjSisyfosMessage,
	TimelineObjVIZMSEAny,
	TimelineObjVIZMSEElementInternal
} from 'timeline-state-resolver-types'
import {
	BaseContent,
	GraphicsContent,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	PieceLifespan,
	TimelineObjectCoreExt
} from 'tv-automation-sofie-blueprints-integration'
import { literal } from '../../../../common/util'
import {
	CueDefinitionGrafik,
	CueDefinitionTelefon,
	CueType
} from '../../../../tv2_afvd_showstyle/inewsConversion/converters/ParseCue'
import { SourceLayer } from '../../../../tv2_afvd_showstyle/layers'
import { VizLLayer } from '../../../../tv2_afvd_studio/layers'
import { EvaluateTelefon } from '../telefon'

describe('telefon', () => {
	test('telefon with vizObj', () => {
		const cue: CueDefinitionTelefon = {
			type: CueType.Telefon,
			source: 'TLF 1',
			vizObj: literal<CueDefinitionGrafik>({
				type: CueType.Grafik,
				template: 'bund',
				textFields: ['Odense', 'Copenhagen']
			}),
			start: {
				seconds: 0
			}
		}
		const pieces: IBlueprintPiece[] = []
		const adLibPieces: IBlueprintAdLibPiece[] = []
		const partId = '0000000001'
		EvaluateTelefon(pieces, adLibPieces, partId, cue)
		expect(pieces).toEqual([
			literal<IBlueprintPiece>({
				_id: '',
				externalId: partId,
				name: 'TLF 1',
				enable: {
					start: 0
				},
				outputLayerId: 'pgm0',
				sourceLayerId: SourceLayer.PgmTelephone,
				infiniteMode: PieceLifespan.OutOnNextPart,
				content: literal<BaseContent>({
					timelineObjects: literal<TimelineObjectCoreExt[]>([
						literal<TimelineObjSisyfosMessage>({
							id: '',
							enable: {
								start: 0
							},
							priority: 1,
							layer: 'sisyfos_telefon_source_TLF_1',
							content: {
								deviceType: DeviceType.SISYFOS,
								type: TimelineContentTypeSisyfos.SISYFOS,
								isPgm: 1,
								faderLevel: 0.75
							}
						})
					])
				})
			}),
			literal<IBlueprintPiece>({
				_id: '',
				externalId: partId,
				name: 'bund - Odense - Copenhagen',
				enable: {
					start: 0
				},
				outputLayerId: 'pgm0',
				sourceLayerId: SourceLayer.PgmGraphics,
				infiniteMode: PieceLifespan.OutOnNextPart,
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
