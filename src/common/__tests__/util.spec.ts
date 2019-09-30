import { assertUnreachable, createVirtualPiece, isAdLibPiece } from '../util'

describe('util', () => {
	it('Creates Virtual Piece', () => {
		expect(createVirtualPiece('Cam', { start: 100, duration: 200 })).toEqual({
			_id: '',
			name: '',
			externalId: '-',
			enable: {
				start: 100,
				duration: 200
			},
			sourceLayerId: 'Cam',
			outputLayerId: 'pgm0',
			virtual: true,
			content: {
				timelineObjects: []
			}
		})

		expect(createVirtualPiece('Cam', 100)).toEqual({
			_id: '',
			name: '',
			externalId: '-',
			enable: {
				start: 100,
				duration: 0
			},
			sourceLayerId: 'Cam',
			outputLayerId: 'pgm0',
			virtual: true,
			content: {
				timelineObjects: []
			}
		})

		const base = {
			_id: '',
			name: '',
			externalId: 'mainPieceId',
			enable: {
				start: 100,
				duration: 0
			},
			sourceLayerId: 'Cam',
			outputLayerId: 'pgm0',
			virtual: true,
			content: {
				timelineObjects: []
			}
		}

		expect(createVirtualPiece('Cam', 100, base)).toEqual({
			_id: '',
			name: '',
			externalId: 'mainPieceId',
			enable: {
				start: 100,
				duration: 0
			},
			sourceLayerId: 'Cam',
			outputLayerId: 'pgm0',
			virtual: true,
			content: {
				timelineObjects: []
			}
		})
	})

	it('Detects AdLib piece', () => {
		expect(
			isAdLibPiece({
				_rank: 0,
				externalId: '-',
				name: 'test adlib',
				sourceLayerId: 'Cam',
				outputLayerId: 'pgm0'
			})
		).toBeTruthy()

		expect(
			isAdLibPiece({
				_id: '-',
				externalId: '-',
				name: 'test non-adlib',
				sourceLayerId: 'Cam',
				outputLayerId: 'pgm0',
				enable: {
					start: 0
				}
			})
		).toBeFalsy()
	})

	it('Asserts Unreachable', () => {
		expect(() => {
			// @ts-ignore
			assertUnreachable({})
		}).toThrowError()
	})
})
