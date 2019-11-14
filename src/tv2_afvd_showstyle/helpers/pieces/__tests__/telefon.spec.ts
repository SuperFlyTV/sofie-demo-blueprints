import {
	DeviceType,
	TimelineContentTypeSisyfos,
	TimelineContentTypeVizMSE,
	TimelineObjSisyfosMessage,
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
import {
	CueDefinitionGrafik,
	CueDefinitionTelefon,
	CueType
} from '../../../../tv2_afvd_showstyle/inewsConversion/converters/ParseCue'
import { SourceLayer } from '../../../../tv2_afvd_showstyle/layers'
import { StudioConfig } from '../../../../tv2_afvd_studio/helpers/config'
import { VizLLayer } from '../../../../tv2_afvd_studio/layers'
import { ShowStyleConfig } from '../../config'
import { EvaluateTelefon } from '../telefon'

describe('telefon', () => {
	test('telefon with vizObj', () => {
		const cue: CueDefinitionTelefon = {
			type: CueType.Telefon,
			source: 'TLF 1',
			vizObj: literal<CueDefinitionGrafik>({
				type: CueType.Grafik,
				template: 'bund',
				cue: 'kg',
				textFields: ['Odense', 'Copenhagen']
			}),
			start: {
				seconds: 0
			}
		}
		const pieces: IBlueprintPiece[] = []
		const adLibPieces: IBlueprintAdLibPiece[] = []
		const partId = '0000000001'
		EvaluateTelefon(
			{
				showStyle: (defaultShowStyleConfig as unknown) as ShowStyleConfig,
				studio: (defaultStudioConfig as unknown) as StudioConfig,
				sources: [],
				mediaPlayers: []
			},
			pieces,
			adLibPieces,
			partId,
			cue
		)
		expect(pieces).toEqual([
			literal<IBlueprintPiece>({
				_id: '',
				externalId: partId,
				name: 'TLF 1',
				enable: {
					start: 0,
					end: 4000
				},
				outputLayerId: 'pgm0',
				sourceLayerId: SourceLayer.PgmGraphicsTLF,
				infiniteMode: PieceLifespan.Normal,
				content: literal<GraphicsContent>({
					fileName: 'bund',
					path: 'bund',
					timelineObjects: [
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
						}),
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
					]
				})
			})
		])
	})
})
