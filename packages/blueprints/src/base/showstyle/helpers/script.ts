import {
	IBlueprintPiece,
	IBlueprintPieceType,
	PieceLifespan,
	ScriptContent,
	WithTimeline,
} from '@sofie-automation/blueprints-integration'
import { literal } from '../../../common/util.js'
import { getOutputLayerForSourceLayer, SourceLayer } from '../applyconfig/layers.js'

function getFirstWords(input: string): string {
	const firstWordsMatch = (input + '').match(/^([\S]*[^\n]){1,3}/)
	if (firstWordsMatch) {
		return firstWordsMatch[0].trim()
	} else {
		return ''
	}
}

function getLastWords(input: string): string {
	const lastWordsMatch = (input + '').match(/([\S]+[\s]*){1,3}$/)
	if (lastWordsMatch) {
		return lastWordsMatch[0].trim()
	} else {
		return ''
	}
}

export function createScriptPiece(script: string | undefined, extId: string): IBlueprintPiece | undefined {
	if (script === undefined || script.trim() === '') return undefined

	const firstWords = getFirstWords(script)
	const lastWords = getLastWords(script)

	return {
		externalId: extId,
		name: (firstWords ? firstWords + '\u2026' : '') + '||' + (lastWords ? '\u2026' + lastWords : ''),
		enable: { start: 0 },
		sourceLayerId: SourceLayer.Script,
		outputLayerId: getOutputLayerForSourceLayer(SourceLayer.Script),
		pieceType: IBlueprintPieceType.InTransition,
		lifespan: PieceLifespan.WithinPart,
		privateData: {
			source: 'script',
		},
		content: literal<WithTimeline<ScriptContent>>({
			sourceDuration: 0,
			fullScript: script,
			firstWords,
			lastWords,
			timelineObjects: [],
		}),
	}
}
