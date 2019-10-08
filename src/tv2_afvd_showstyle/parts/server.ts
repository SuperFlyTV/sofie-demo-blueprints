import {
	DeviceType,
	TimelineContentTypeCasparCg,
	TimelineObjCCGMedia,
	TimelineObjSisyfosAny,
	TimelineContentTypeSisyfos
} from 'timeline-state-resolver-types'
import {
	BlueprintResultPart,
	IBlueprintAdLibPiece,
	IBlueprintPart,
	IBlueprintPiece,
	IBlueprintPieceDB,
	PieceLifespan,
	TimelineObjectCoreExt,
	VTContent
} from 'tv-automation-sofie-blueprints-integration'
import { literal } from '../../common/util'
import { CasparLLayer, SisyfosLLAyer } from '../../tv2_afvd_studio/layers'
import { BlueprintConfig } from '../helpers/config'
import { PartDefinition, PartType } from '../inewsConversion/converters/ParseBody'
import { SourceLayer } from '../layers'
import { CreatePartInvalid } from './invalid'

export function CreatePartServer(_config: BlueprintConfig, partDefinition: PartDefinition): BlueprintResultPart {
	if (partDefinition.fields === undefined) {
		return CreatePartInvalid(partDefinition)
	}

	if (!partDefinition.fields.videoId) {
		return CreatePartInvalid(partDefinition)
	}

	const file = partDefinition.fields.videoId
	const duration = Number(partDefinition.fields.totalTime) * 1000 || 0

	const part = literal<IBlueprintPart>({
		externalId: partDefinition.externalId,
		title: PartType[partDefinition.type] + ' - ' + partDefinition.rawType,
		metaData: {},
		typeVariant: '',
		expectedDuration: duration,
		displayDuration: duration
	})

	const adLibPieces: IBlueprintAdLibPiece[] = []
	const pieces: IBlueprintPiece[] = []

	pieces.push(
		literal<IBlueprintPieceDB>({
			_id: '',
			externalId: partDefinition.externalId,
			name: file,
			enable: { start: 0, duration },
			playoutDuration: duration,
			outputLayerId: 'pgm0',
			sourceLayerId: SourceLayer.PgmServer,
			infiniteMode: PieceLifespan.OutOnNextPart,
			content: literal<VTContent>({
				studioLabel: '',
				fileName: file,
				path: file,
				firstWords: '',
				lastWords: '',
				sourceDuration: Number(partDefinition.fields.totalTime) || 0,
				timelineObjects: literal<TimelineObjectCoreExt[]>([
					literal<TimelineObjCCGMedia>({
						id: '',
						enable: {
							start: 0,
							duration
						},
						priority: 1,
						layer: CasparLLayer.CasparPlayerClipPending,
						content: {
							deviceType: DeviceType.CASPARCG,
							type: TimelineContentTypeCasparCg.MEDIA,
							file,
							length: duration
						}
					}),

					literal<TimelineObjSisyfosAny>({
						id: '',
						enable: {
							start: 0,
							duration
						},
						priority: 1,
						layer: SisyfosLLAyer.SisyfosSourceClipPending,
						content: {
							deviceType: DeviceType.SISYFOS,
							type: TimelineContentTypeSisyfos.SISYFOS,
							isPgm: true,
							faderLevel: 0
						}
					})
				])
			})
		})
	)

	return {
		part,
		adLibPieces,
		pieces
	}
}
