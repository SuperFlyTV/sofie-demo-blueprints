import {
	BlueprintResultPart,
	IBlueprintAdLibPiece,
	IBlueprintPart,
	IBlueprintPiece,
	PartContext,
	PieceLifespan
} from 'tv-automation-sofie-blueprints-integration'
import { literal } from '../../common/util'
import { PieceMetaData } from '../../tv2_afvd_studio/onTimelineGenerate'
import { BlueprintConfig } from '../helpers/config'
import { MakeContentServer } from '../helpers/content/server'
import { EvaluateCues } from '../helpers/pieces/evaluateCues'
import { AddScript } from '../helpers/pieces/script'
import { PartDefinition, PartType } from '../inewsConversion/converters/ParseBody'
import { SourceLayer } from '../layers'
import { EffektTransitionPiece, GetEffektAutoNext } from './effekt'
import { CreatePartInvalid } from './invalid'

export function CreatePartServer(
	context: PartContext,
	config: BlueprintConfig,
	partDefinition: PartDefinition
): BlueprintResultPart {
	if (partDefinition.fields === undefined) {
		return CreatePartInvalid(partDefinition)
	}

	if (!partDefinition.fields.videoId) {
		return CreatePartInvalid(partDefinition)
	}

	const file = partDefinition.fields.videoId
	const duration = Number(partDefinition.fields.tapeTime) * 1000 || 0

	let part = literal<IBlueprintPart>({
		externalId: partDefinition.externalId,
		title: PartType[partDefinition.type] + ' - ' + partDefinition.rawType,
		metaData: {},
		typeVariant: '',
		expectedDuration: duration,
		displayDuration: duration
	})

	const adLibPieces: IBlueprintAdLibPiece[] = []
	let pieces: IBlueprintPiece[] = []

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
				mediaPlayerSessions: [part.externalId]
			}),
			content: MakeContentServer(file, duration, part.externalId)
		})
	)

	part = { ...part, ...GetEffektAutoNext(context, config, partDefinition) }
	pieces = [...pieces, ...EffektTransitionPiece(context, config, partDefinition)]

	EvaluateCues(context, config, pieces, adLibPieces, partDefinition.cues, partDefinition)
	AddScript(partDefinition, pieces)

	if (pieces.length === 0) {
		return CreatePartInvalid(partDefinition)
	}

	return {
		part,
		adLibPieces,
		pieces
	}
}
