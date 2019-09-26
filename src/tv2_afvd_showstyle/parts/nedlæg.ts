import {
	BlueprintResultPart,
	IBlueprintAdLibPiece,
	IBlueprintPart,
	IBlueprintPiece,
	PieceLifespan
} from 'tv-automation-sofie-blueprints-integration'
import { literal } from '../../common/util'
import { PartDefinition, PartType } from '../inewsConversion/converters/ParseBody'
import { SourceLayer } from '../layers'

export function CreatePartNedlæg(partDefinition: PartDefinition): BlueprintResultPart {
	const part = literal<IBlueprintPart>({
		externalId: partDefinition.externalId,
		title: PartType[partDefinition.type] + ' - ' + partDefinition.rawType,
		metaData: {},
		typeVariant: '',
		expectedDuration: 0
	})

	const adLibPieces: IBlueprintAdLibPiece[] = []
	const pieces: IBlueprintPiece[] = []

	pieces.push(
		literal<IBlueprintPiece>({
			_id: '',
			externalId: partDefinition.externalId,
			name: part.title,
			enable: { start: 0 },
			outputLayerId: 'pgm0',
			sourceLayerId: SourceLayer.PgmRemote,
			infiniteMode: PieceLifespan.OutOnNextPart
		})
	)

	return {
		part,
		adLibPieces,
		pieces
	}
}
