import {
	DeviceType,
	TimelineContentTypeCasparCg,
	TimelineContentTypeSisyfos,
	TimelineObjCCGMedia,
	TimelineObjSisyfosAny
} from 'timeline-state-resolver-types'
import {
	BlueprintResultPart,
	IBlueprintAdLibPiece,
	IBlueprintPart,
	IBlueprintPiece,
	PieceLifespan,
	TimelineObjectCoreExt,
	VTContent
} from 'tv-automation-sofie-blueprints-integration'
import { literal } from '../../common/util'
import { CasparLLayer, SisyfosLLAyer } from '../../tv2_afvd_studio/layers'
import { PieceMetaData, TimelineBlueprintExt } from '../../tv2_afvd_studio/onTimelineGenerate'
import { BlueprintConfig } from '../helpers/config'
import { PartDefinition, PartType } from '../inewsConversion/converters/ParseBody'
import { SourceLayer } from '../layers'
import { CreatePartInvalid } from './invalid'

export function CreatePartServer(
	_config: BlueprintConfig,
	partDefinition: PartDefinition,
	mediaPlayerSessionId: string
): BlueprintResultPart {
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
		literal<IBlueprintPiece>({
			_id: '',
			externalId: partDefinition.externalId,
			name: file,
			enable: { start: 0 },
			outputLayerId: 'pgm0',
			sourceLayerId: SourceLayer.PgmServer,
			infiniteMode: PieceLifespan.OutOnNextPart,
			metaData: literal<PieceMetaData>({
				mediaPlayerSessions: [mediaPlayerSessionId]
			}),
			content: literal<VTContent>({
				studioLabel: '',
				fileName: file,
				path: file,
				firstWords: '',
				lastWords: '',
				sourceDuration: duration,
				timelineObjects: literal<TimelineObjectCoreExt[]>([
					literal<TimelineObjCCGMedia & TimelineBlueprintExt>({
						id: '',
						enable: {
							start: 0
						},
						priority: 1,
						layer: CasparLLayer.CasparPlayerClipPending,
						content: {
							deviceType: DeviceType.CASPARCG,
							type: TimelineContentTypeCasparCg.MEDIA,
							file,
							length: duration
						},
						metaData: {
							mediaPlayerSession: mediaPlayerSessionId
						}
					}),

					literal<TimelineObjSisyfosAny & TimelineBlueprintExt>({
						id: '',
						enable: {
							start: 0
						},
						priority: 1,
						layer: SisyfosLLAyer.SisyfosSourceClipPending,
						content: {
							deviceType: DeviceType.SISYFOS,
							type: TimelineContentTypeSisyfos.SISYFOS,
							isPgm: 1,
							faderLevel: 0
						},
						metaData: {
							mediaPlayerSession: mediaPlayerSessionId
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
