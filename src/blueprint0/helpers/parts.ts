import { literal } from '../../common/util'
import { SourceLayer } from '../../types/layers'
import { IngestPart, BlueprintResultPart, IBlueprintPart, IBlueprintPiece, IBlueprintAdLibPiece } from 'tv-automation-sofie-blueprints-integration'

/**
 * Creates a generic part. Only used as a placeholder for part types that have not been implemented yet.
 * @param {Piece} piece Piece to evaluate.
 */
export function createGeneric (ingestPart: IngestPart): BlueprintResultPart {
	const part = literal<IBlueprintPart>({
		externalId: ingestPart.externalId,
		title: ingestPart.name || 'Unknown',
		metaData: {},
		typeVariant: '',
		expectedDuration: 5000
	})

	const piece = literal<IBlueprintPiece>({
		_id: '',
		externalId: ingestPart.externalId,
		name: part.title,
		enable: { start: 0, duration: 100 },
		outputLayerId: 'pgm0',
		sourceLayerId: SourceLayer.PgmCam
	})

	return {
		part,
		adLibPieces: [],
		pieces: [piece]
	}
}

/**
 * Creates a part from an ingest part and associated pieces.
 * @param {IngestPart} ingestPart Ingest part.
 * @param {IBlueprintPiece[]} pieces Array of pieces.
 */
export function createPart (ingestPart: IngestPart, pieces: IBlueprintPiece[], adLibPieces: IBlueprintAdLibPiece[]): BlueprintResultPart {
	const part = literal<IBlueprintPart>({
		externalId: ingestPart.externalId,
		title: ingestPart.name || 'Unknown',
		metaData: {},
		typeVariant: '',
		expectedDuration: calculateExpectedDuration(pieces)
	})

	return {
		part,
		adLibPieces: adLibPieces,
		pieces: pieces
	}
}

/**
 * Calculates the expected duration of a part from component pieces.
 * @param {IBlueprintPiece[]} pieces Pieces to calculate duration for.
 */
function calculateExpectedDuration (pieces: IBlueprintPiece[]): number {
	if (pieces.length) {
		let start = 0
		let end = 0

		pieces.forEach(piece => {
			if (!piece.isTransition) {
				let st = piece.enable.start as number
				let en = piece.enable.start as number
				if (piece.enable.duration) {
					en = (piece.enable.start as number) + (piece.enable.duration as number)
				} else if (piece.enable.end) {
					en = (piece.enable.end as number)
				}

				if (piece.infiniteMode) {
					en = en + 1000
				}

				if (st < start) {
					start = st
				}

				if (en > end) {
					end = en
				}

				if (st > end) {
					end = st
				}
			}
		})

		return end - start
	}
	return 0
}