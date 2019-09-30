import { DeviceType } from 'timeline-state-resolver-types'
import { IBlueprintAsRunLogEventContent, LookaheadMode } from 'tv-automation-sofie-blueprints-integration'
import onAsRunEvent from '../onAsRunEvent'

describe('onAsRunevent', () => {
	const runEvent = {
		_id: 'studio0Runevent',
		studioId: 'studio0',
		rundownId: 'rundown0',
		timestamp: 0,
		content: IBlueprintAsRunLogEventContent.STARTEDPLAYBACK,
		rehersal: true
	}
	it('Returns empty promise', () => {
		expect(
			onAsRunEvent({
				asRunEvent: runEvent,
				rundownId: 'rundown0',
				rundown: {
					_id: '',
					showStyleVariantId: '',
					externalId: '',
					name: ''
				},
				getAllAsRunEvents: () => {
					return [runEvent]
				},
				getSegments: () => {
					return []
				},
				getSegment: () => {
					return undefined
				},
				getPart: () => {
					return undefined
				},
				getParts: () => {
					return []
				},
				getPiece: () => {
					return undefined
				},
				getPieces: () => {
					return []
				},
				getIngestDataForRundown: () => {
					return undefined
				},
				getIngestDataForPart: () => {
					return undefined
				},
				formatDateAsTimecode: (time: number) => {
					return time.toString()
				},
				formatDurationAsTimecode: (time: number) => {
					return time.toString()
				},
				error: (_: string) => {
					return
				},
				warning: (_: string) => {
					return
				},
				getNotes: () => {
					return []
				},
				getHashId: (_: string, __?: boolean) => {
					return ''
				},
				unhashId: (hash: string) => {
					return hash
				},
				getStudioMappings: () => {
					return {
						'1': {
							device: DeviceType.ATEM,
							deviceId: '',
							lookahead: LookaheadMode.NONE
						}
					}
				},
				getStudioConfig: () => {
					return {
						'1': false
					}
				},
				getShowStyleConfig: () => {
					return {
						'1': false
					}
				},
				getStudioConfigRef: (key: string) => {
					return key
				},
				getShowStyleConfigRef: (key: string) => {
					return key
				}
			})
		).toBeTruthy()
	})
})
