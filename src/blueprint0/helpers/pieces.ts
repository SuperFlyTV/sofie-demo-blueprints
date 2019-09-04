import _ = require('underscore')
import { Piece, PieceParams, ObjectType } from '../../types/classes'
import {
	IBlueprintAdLibPiece, IBlueprintPiece, PieceEnable, PieceLifespan, TransitionContent, ScriptContent
} from 'tv-automation-sofie-blueprints-integration'
import { literal } from '../../common/util'
import { SourceLayer } from '../../types/layers'
import {
	TSRTimelineObj
} from 'timeline-state-resolver-types'
import { Attributes } from './sources'

/**
 * Creates a generic adLib piece.
 * @param {Piece} piece Piece properties.
 */
export function CreatePieceGenericAdLib (piece: Piece): IBlueprintAdLibPiece {
	let p = literal<IBlueprintAdLibPiece>({
		externalId: piece.id,
		name: piece.clipName,
		outputLayerId: 'pgm0',
		sourceLayerId: SourceLayer.PgmCam,
		metaData: piece.attributes,
		_rank: 0
	})

	if (!piece.duration) {
		p.expectedDuration = piece.duration
	}

	return p
}

/**
 * Creates a generic IBlueprintPiece.
 * @param {Piece} piece Piece properties.
 */
export function CreatePieceGenericEnable (piece: Piece): IBlueprintPiece {
	let enable: PieceEnable = {}
	enable.start = piece.objectTime || 0

	let p = literal<IBlueprintPiece>({
		_id: '',
		externalId: piece.id,
		name: piece.clipName,
		enable: enable,
		outputLayerId: 'pgm0',
		sourceLayerId: SourceLayer.PgmCam,
		metaData: piece.attributes
	})

	if (piece.duration) {
		enable.duration = piece.duration
		p.enable = enable
	}

	return p
}

/**
 * Creates a generic piece. Will return an Adlib piece if suitable.
 * @param {Piece} piece Piece to evaluate.
 * @returns {IBlueprintPieceGeneric} A possibly infinite, possibly Adlib piece.
 */
export function CreatePieceGeneric (piece: Piece): IBlueprintAdLibPiece | IBlueprintPiece {
	let p: IBlueprintPiece | IBlueprintAdLibPiece

	if ('adlib' in piece.attributes && piece.attributes['adlib'] === 'true') {
		p = CreatePieceGenericAdLib(piece)
	} else {
		p = CreatePieceGenericEnable(piece)
	}

	// TODO: This may become context-specific
	if (!piece.duration) {
		p.infiniteMode = PieceLifespan.OutOnNextPart
	}

	return p
}

export function createPieceTransitionGeneric (piece: Piece, duration: number): IBlueprintPiece {
	let p = literal<IBlueprintPiece>({
		_id: '',
		externalId: 'T' + piece.id,
		name: 'T' + duration,
		enable: {
			start: 0,
			duration: duration
		},
		outputLayerId: 'pgm0',
		sourceLayerId: SourceLayer.PgmTransition,
		isTransition: true,
		content: literal<TransitionContent>({
			timelineObjects: _.compact<TSRTimelineObj>([

			])
		})
	})

	return p
}

/**
 * Creates a script piece.
 * @param {PieceParams} params Piece to create.
 */
export function CreatePieceScript (params: PieceParams): IBlueprintPiece {
	let p = CreatePieceGenericEnable(params.piece)

	p.sourceLayerId = SourceLayer.PgmScript
	let scriptWords: string[] = []
	if (params.piece.script) {
		scriptWords = params.piece.script.replace('\n', ' ').split(' ')
	}

	let duration = 3000
	if (p.enable.duration) {
		duration = Number(p.enable.duration)

		if (isNaN(duration)) {
			duration = 3000
		}
	}

	let firstWords = scriptWords.slice(0, Math.min(4, scriptWords.length)).join(' ')
	let lastWords = scriptWords.slice(scriptWords.length - (Math.min(4, scriptWords.length)), (Math.min(4, scriptWords.length))).join(' ')

	let scriptParent = ''

	switch (params.piece.objectType) {
		case ObjectType.CAMERA:
			scriptParent = params.piece.attributes[Attributes.CAMERA]
			break
		case ObjectType.GRAPHIC:
			scriptParent = 'Super'
			break
		case ObjectType.VIDEO:
			scriptParent = 'VT'
			break
		case ObjectType.REMOTE:
			scriptParent = params.piece.attributes[Attributes.REMOTE]
			break
	}

	p.name = (firstWords ? firstWords + '\u2026' : '') + '||' + (lastWords ? '\u2026' + lastWords : '')

	let content: ScriptContent = {
		firstWords: firstWords,
		lastWords: lastWords,
		fullScript: scriptParent ? `/${scriptParent}/ ${(params.piece.script || '')} /end-${scriptParent}/` : (params.piece.script || ''),
		sourceDuration: duration,
		lastModified: Date.now() // TODO: pull from gateway
	}

	p.content = content

	return p
}

/**
 * Checks whether a piece should be placed on a screen, if so, it places it on the corresponding screen.
 * @param {IBlueprintPiece} p The Piece blueprint to modify.
 * @param {any} attr Attributes of the piece.
 */
export function checkAndPlaceOnScreen (p: IBlueprintPiece | IBlueprintAdLibPiece, attr: any): boolean {
	if ('screen' in attr) {
		if (attr['screen'] !== '') {
			p.outputLayerId = attr['screen']
			return true
		}
	}
	return false
}
