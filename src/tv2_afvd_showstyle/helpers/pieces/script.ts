import { IBlueprintPiece, PieceLifespan, ScriptContent } from 'tv-automation-sofie-blueprints-integration'
import { literal } from '../../../common/util'
import { PartDefinition } from '../../../tv2_afvd_showstyle/inewsConversion/converters/ParseBody'
import { SourceLayer } from '../../../tv2_afvd_showstyle/layers'

const PREVIEW_CHARACTERS = 30

export function AddScript(part: PartDefinition, pieces: IBlueprintPiece[]) {
	const script = part.script.replace(/^\**/, '').trim()
	if (script.length) {
		const stripLength = Math.min(PREVIEW_CHARACTERS, script.length)
		pieces.push(
			literal<IBlueprintPiece>({
				_id: '',
				externalId: part.externalId,
				name: script.slice(0, stripLength),
				enable: {
					start: 0,
					end: part.fields.audioTime
				},
				outputLayerId: 'pgm0',
				sourceLayerId: SourceLayer.PgmScript,
				infiniteMode: PieceLifespan.OutOnNextPart,
				content: literal<ScriptContent>({
					firstWords: script.slice(0, stripLength),
					lastWords: script.slice(script.length - stripLength, stripLength),
					fullScript: script,
					sourceDuration: Number(part.fields.audioTime),
					lastModified: part.modified * 1000
				})
			})
		)
	}
}
