import { IBlueprintPiece, PieceLifespan } from 'tv-automation-sofie-blueprints-integration'
import { literal } from '../../common/util'
import { CreateTiming } from '../helpers/pieces/evaluateCues'
import { CueDefinitionUnknown, CueType } from '../inewsConversion/converters/ParseCue'

describe('CreateTiming', () => {
	test('Start only (seconds)', () => {
		const time: CueDefinitionUnknown = {
			type: CueType.Unknown,
			start: {
				seconds: 1
			}
		}
		const result = CreateTiming(time)
		expect(result).toEqual(
			literal<Pick<IBlueprintPiece, 'enable' | 'infiniteMode'>>({
				enable: {
					start: 1000
				},
				infiniteMode: PieceLifespan.OutOnNextPart
			})
		)
	})

	test('Start only (frames)', () => {
		const time: CueDefinitionUnknown = {
			type: CueType.Unknown,
			start: {
				frames: 1
			}
		}
		const result = CreateTiming(time)
		expect(result).toEqual(
			literal<Pick<IBlueprintPiece, 'enable' | 'infiniteMode'>>({
				enable: {
					start: 40
				},
				infiniteMode: PieceLifespan.OutOnNextPart
			})
		)
	})

	test('Start only (seconds and frames)', () => {
		const time: CueDefinitionUnknown = {
			type: CueType.Unknown,
			start: {
				seconds: 1,
				frames: 1
			}
		}
		const result = CreateTiming(time)
		expect(result).toEqual(
			literal<Pick<IBlueprintPiece, 'enable' | 'infiniteMode'>>({
				enable: {
					start: 1040
				},
				infiniteMode: PieceLifespan.OutOnNextPart
			})
		)
	})

	test('End only (seconds)', () => {
		const time: CueDefinitionUnknown = {
			type: CueType.Unknown,
			end: {
				seconds: 1
			}
		}
		const result = CreateTiming(time)
		expect(result).toEqual(
			literal<Pick<IBlueprintPiece, 'enable' | 'infiniteMode'>>({
				enable: {
					start: 0,
					end: 1000
				},
				infiniteMode: PieceLifespan.Normal
			})
		)
	})

	test('End only (frames)', () => {
		const time: CueDefinitionUnknown = {
			type: CueType.Unknown,
			end: {
				frames: 1
			}
		}
		const result = CreateTiming(time)
		expect(result).toEqual(
			literal<Pick<IBlueprintPiece, 'enable' | 'infiniteMode'>>({
				enable: {
					start: 0,
					end: 40
				},
				infiniteMode: PieceLifespan.Normal
			})
		)
	})

	test('End only (seconds and frames)', () => {
		const time: CueDefinitionUnknown = {
			type: CueType.Unknown,
			end: {
				seconds: 1,
				frames: 1
			}
		}
		const result = CreateTiming(time)
		expect(result).toEqual(
			literal<Pick<IBlueprintPiece, 'enable' | 'infiniteMode'>>({
				enable: {
					start: 0,
					end: 1040
				},
				infiniteMode: PieceLifespan.Normal
			})
		)
	})

	test('End only (B)', () => {
		const time: CueDefinitionUnknown = {
			type: CueType.Unknown,
			end: {
				infiniteMode: 'B'
			}
		}
		const result = CreateTiming(time)
		expect(result).toEqual(
			literal<Pick<IBlueprintPiece, 'enable' | 'infiniteMode'>>({
				enable: {
					start: 0
				},
				infiniteMode: PieceLifespan.OutOnNextPart
			})
		)
	})

	test('End only (S)', () => {
		const time: CueDefinitionUnknown = {
			type: CueType.Unknown,
			end: {
				infiniteMode: 'S'
			}
		}
		const result = CreateTiming(time)
		expect(result).toEqual(
			literal<Pick<IBlueprintPiece, 'enable' | 'infiniteMode'>>({
				enable: {
					start: 0
				},
				infiniteMode: PieceLifespan.OutOnNextSegment
			})
		)
	})

	test('End only (O)', () => {
		const time: CueDefinitionUnknown = {
			type: CueType.Unknown,
			end: {
				infiniteMode: 'O'
			}
		}
		const result = CreateTiming(time)
		expect(result).toEqual(
			literal<Pick<IBlueprintPiece, 'enable' | 'infiniteMode'>>({
				enable: {
					start: 0
				},
				infiniteMode: PieceLifespan.Infinite
			})
		)
	})

	test('Start and end (timing)', () => {
		const time: CueDefinitionUnknown = {
			type: CueType.Unknown,
			start: {
				frames: 1
			},
			end: {
				seconds: 1
			}
		}
		const result = CreateTiming(time)
		expect(result).toEqual(
			literal<Pick<IBlueprintPiece, 'enable' | 'infiniteMode'>>({
				enable: {
					start: 40,
					end: 1000
				},
				infiniteMode: PieceLifespan.Normal
			})
		)
	})

	test('Start and end (infinite)', () => {
		const time: CueDefinitionUnknown = {
			type: CueType.Unknown,
			start: {
				frames: 1
			},
			end: {
				infiniteMode: 'B'
			}
		}
		const result = CreateTiming(time)
		expect(result).toEqual(
			literal<Pick<IBlueprintPiece, 'enable' | 'infiniteMode'>>({
				enable: {
					start: 40
				},
				infiniteMode: PieceLifespan.OutOnNextPart
			})
		)
	})
})
