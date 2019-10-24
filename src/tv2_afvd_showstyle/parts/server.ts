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
import { PartDefinition, PartType } from '../inewsConversion/converters/ParseBody'
import { SourceLayer } from '../layers'
import { CreatePartInvalid } from './invalid'
import { AddScript } from '../helpers/pieces/script'

export function CreatePartServer(
	context: PartContext,
	config: BlueprintConfig,
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
	const duration = Number(partDefinition.fields.tapeTime) * 1000 || 0

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
			content: MakeContentServer(file, duration, mediaPlayerSessionId)
		})
	)

	EvaluateCues(context, config, pieces, adLibPieces, partDefinition.cues, partDefinition)
	AddScript(partDefinition, pieces)

	return {
		part,
		adLibPieces,
		pieces
	}
}
