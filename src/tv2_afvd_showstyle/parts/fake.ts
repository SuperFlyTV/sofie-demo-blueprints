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

export function CreatePartFake(partDefinition: PartDefinition): BlueprintResultPart {
	const part = literal<IBlueprintPart>({
		externalId: 'fake-' + partDefinition.externalId,
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
			name: 'Fake Piece',
			enable: { start: 0 },
			outputLayerId: 'pgm0',
			sourceLayerId: SourceLayer.PgmCam,
			infiniteMode: PieceLifespan.OutOnNextPart
		}),
		literal<IBlueprintPiece>({
			_id: '',
			externalId: partDefinition.externalId,
			name: 'Fake Piece',
			enable: { start: 0 },
			outputLayerId: 'pgm0',
			sourceLayerId: SourceLayer.PgmServer,
			infiniteMode: PieceLifespan.OutOnNextPart
		}),
		literal<IBlueprintPiece>({
			_id: '',
			externalId: partDefinition.externalId,
			name: 'Fake Piece',
			enable: { start: 0 },
			outputLayerId: 'pgm0',
			sourceLayerId: SourceLayer.PgmVoiceOver,
			infiniteMode: PieceLifespan.OutOnNextPart
		}),
		literal<IBlueprintPiece>({
			_id: '',
			externalId: partDefinition.externalId,
			name: 'Fake Piece',
			enable: { start: 0 },
			outputLayerId: 'pgm0',
			sourceLayerId: SourceLayer.PgmGraphics,
			infiniteMode: PieceLifespan.OutOnNextPart
		}),
		literal<IBlueprintPiece>({
			_id: '',
			externalId: partDefinition.externalId,
			name: 'Fake Piece',
			enable: { start: 0 },
			outputLayerId: 'pgm0',
			sourceLayerId: SourceLayer.PgmJingle,
			infiniteMode: PieceLifespan.OutOnNextPart
		}),
		literal<IBlueprintPiece>({
			_id: '',
			externalId: partDefinition.externalId,
			name: 'Fake Piece',
			enable: { start: 0 },
			outputLayerId: 'pgm0',
			sourceLayerId: SourceLayer.PgmLive,
			infiniteMode: PieceLifespan.OutOnNextPart
		}),
		literal<IBlueprintPiece>({
			_id: '',
			externalId: partDefinition.externalId,
			name: 'Fake Piece',
			enable: { start: 0 },
			outputLayerId: 'pgm0',
			sourceLayerId: SourceLayer.PgmDVE,
			infiniteMode: PieceLifespan.OutOnNextPart
		}),
		literal<IBlueprintPiece>({
			_id: '',
			externalId: partDefinition.externalId,
			name: 'Fake Piece',
			enable: { start: 0 },
			outputLayerId: 'pgm0',
			sourceLayerId: SourceLayer.PgmTelephone,
			infiniteMode: PieceLifespan.OutOnNextPart
		}),
		literal<IBlueprintPiece>({
			_id: '',
			externalId: partDefinition.externalId,
			name: 'Fake Piece',
			enable: { start: 0 },
			outputLayerId: 'pgm0',
			sourceLayerId: SourceLayer.PgmScript,
			infiniteMode: PieceLifespan.OutOnNextPart,
			content: {
				firstWords: 'Fake',
				lastWords: 'Piece',
				fullScript: 'Fake Piece'
			}
		}),
		literal<IBlueprintPiece>({
			_id: '',
			externalId: partDefinition.externalId,
			name: 'Fake Piece',
			enable: { start: 0 },
			outputLayerId: 'pgm0',
			sourceLayerId: SourceLayer.PgmAudioBed,
			infiniteMode: PieceLifespan.OutOnNextPart
		})
	)

	return {
		part,
		adLibPieces,
		pieces
	}
}
