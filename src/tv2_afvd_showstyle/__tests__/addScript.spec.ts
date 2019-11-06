import { literal } from '../../common/util'

import { IBlueprintPiece, PieceLifespan, ScriptContent } from 'tv-automation-sofie-blueprints-integration'
import { AddScript } from '../helpers/pieces/script'
import { PartDefinitionKam, PartType } from '../inewsConversion/converters/ParseBody'
import { SourceLayer } from '../layers'

describe('addScript', () => {
	test('adds A script', () => {
		const part = literal<PartDefinitionKam>({
			externalId: '00000000001-0',
			type: PartType.Kam,
			variant: {
				name: '2'
			},
			rawType: 'KAM 2',
			cues: [],
			script: 'Hallo, I wnat to tell you......\nHEREEEELLLLOOOK\nYES\n',
			fields: {},
			modified: 0
		})
		const result: IBlueprintPiece[] = []
		AddScript(part, result, 1000, false)
		expect(result).toEqual([
			literal<IBlueprintPiece>({
				_id: '',
				externalId: part.externalId,
				name: 'Hallo, I wnat to tell you.....',
				enable: {
					start: 0,
					end: 1000
				},
				outputLayerId: 'pgm0',
				sourceLayerId: SourceLayer.PgmScript,
				infiniteMode: PieceLifespan.OutOnNextPart,
				content: literal<ScriptContent>({
					firstWords: 'Hallo, I wnat to tell you.....',
					lastWords: 'you...... HEREEEELLLLOOOK YES',
					fullScript: 'Hallo, I wnat to tell you......\nHEREEEELLLLOOOK\nYES',
					sourceDuration: 1000,
					lastModified: part.modified * 1000
				})
			})
		])
	})
})
