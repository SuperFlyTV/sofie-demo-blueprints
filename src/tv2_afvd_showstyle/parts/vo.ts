import { DeviceType, TimelineContentTypeSisyfos, TimelineObjSisyfosMessage } from 'timeline-state-resolver-types'
import {
	BlueprintResultPart,
	IBlueprintAdLibPiece,
	IBlueprintPart,
	IBlueprintPiece,
	PartContext,
	PieceLifespan,
	PieceMetaData
} from 'tv-automation-sofie-blueprints-integration'
import { literal } from '../../common/util'
import { SisyfosLLAyer } from '../../tv2_afvd_studio/layers'
import { BlueprintConfig } from '../helpers/config'
import { MakeContentServer } from '../helpers/content/server'
import { EvaluateCues } from '../helpers/pieces/evaluateCues'
import { AddScript } from '../helpers/pieces/script'
import { PartDefinition } from '../inewsConversion/converters/ParseBody'
import { SourceLayer } from '../layers'
import { EffektTransitionPiece, GetEffektAutoNext } from './effekt'
import { CreatePartInvalid } from './invalid'
import { PartTime } from './time/partTime'

export function CreatePartVO(
	context: PartContext,
	config: BlueprintConfig,
	partDefinition: PartDefinition,
	totalWords: number
): BlueprintResultPart {
	if (partDefinition.fields === undefined) {
		context.warning('Video ID not set!')
		return CreatePartInvalid(partDefinition)
	}

	if (!partDefinition.fields.videoId) {
		context.warning('Video ID not set!')
		return CreatePartInvalid(partDefinition)
	}

	const partTime = PartTime(partDefinition, totalWords)
	let part = literal<IBlueprintPart>({
		externalId: partDefinition.externalId,
		title: `${partDefinition.rawType} - ${partDefinition.fields.videoId}`,
		metaData: {},
		typeVariant: '',
		expectedDuration: partTime
	})

	const file = partDefinition.fields.videoId
	const duration = Number(partDefinition.fields.tapeTime) * 1000 || 0

	const adLibPieces: IBlueprintAdLibPiece[] = []
	let pieces: IBlueprintPiece[] = []

	const serverContent = MakeContentServer(file, duration, partDefinition.externalId)
	serverContent.timelineObjects.push(
		literal<TimelineObjSisyfosMessage>({
			id: '',
			enable: {
				start: 0
			},
			priority: 1,
			layer: SisyfosLLAyer.SisyfosSourceLiveSpeak,
			content: {
				deviceType: DeviceType.SISYFOS,
				type: TimelineContentTypeSisyfos.SISYFOS,
				isPgm: 1
			}
		})
	)

	pieces.push(
		literal<IBlueprintPiece>({
			_id: '',
			externalId: partDefinition.externalId,
			name: part.title,
			enable: { start: 0 },
			outputLayerId: 'pgm0',
			sourceLayerId: SourceLayer.PgmVoiceOver,
			infiniteMode: PieceLifespan.OutOnNextPart,
			metaData: literal<PieceMetaData>({
				mediaPlayerSessions: [part.externalId]
			}),
			content: serverContent
		})
	)

	part = { ...part, ...GetEffektAutoNext(context, config, partDefinition) }
	pieces = [...pieces, ...EffektTransitionPiece(context, config, partDefinition)]

	EvaluateCues(context, config, pieces, adLibPieces, partDefinition.cues, partDefinition)
	AddScript(partDefinition, pieces, duration, true)

	if (pieces.length === 0 && adLibPieces.length === 0) {
		return CreatePartInvalid(partDefinition)
	}

	return {
		part,
		adLibPieces,
		pieces
	}
}
