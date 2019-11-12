import {
	DeviceType,
	TimelineContentTypeHTTP,
	TimelineContentTypeLawo,
	TimelineObjHTTPRequest,
	TimelineObjLawoSource,
	TSRTimelineObjBase
} from 'timeline-state-resolver-types'
import {
	BlueprintResultTimeline,
	IBlueprintPieceDB,
	OnGenerateTimelineObj,
	PartEndState,
	PartEventContext,
	PieceMetaData as PieceMetaDataBase,
	RundownContext,
	TimelineObjectCoreExt,
	TimelinePersistentState
} from 'tv-automation-sofie-blueprints-integration'
import * as _ from 'underscore'
import { parseConfig } from '../tv2_afvd_showstyle/helpers/config'
import { assignMediaPlayers } from './helpers/abPlayback'

export interface PartEndStateExt extends PartEndState {
	stickyLawoLevels: { [key: string]: number | undefined }
}

export interface MediaPlayerClaim {
	sessionId: string
	playerId: number
	lookahead: boolean
}

export interface TimelinePersistentStateExt extends TimelinePersistentState {
	activeMediaPlayers: { [player: string]: MediaPlayerClaim[] | undefined }
}

export interface TimelineBlueprintExt extends TimelineObjectCoreExt {
	/** Metadata for use by the OnTimelineGenerate or other callbacks */
	metaData?: {
		lawoPersistLevel?: boolean
		mediaPlayerSession?: string
	}
}

export interface PieceMetaData extends PieceMetaDataBase {
	stickyLawoLevels?: { [key: string]: { value: number; followsPrevious: boolean } }
	mediaPlayerSessions?: string[]
	mediaPlayerOptional?: boolean
}

export function onTimelineGenerate(
	context: PartEventContext,
	timeline: OnGenerateTimelineObj[],
	previousPersistentState: TimelinePersistentState | undefined,
	previousPartEndState: PartEndState | undefined,
	resolvedPieces: IBlueprintPieceDB[]
): Promise<BlueprintResultTimeline> {
	timeline = validateNoraPreload(timeline)

	// // TODO - remove this HACK!
	// forEachOfType<TimelineObjCCGMedia>(timeline, obj => {
	// 	return obj.isLookahead
	// }, (obj) => {
	// 	// TODO - this isnt the ideal mode, as we cant ever loadbg if doing back to back.
	// 	// Instead TSR/ccg-state should be able to choose a load or loadbg
	// 	obj.content.playing = false
	// 	obj.content.noStarttime = true
	// 	obj.isLookahead = false;
	// 	(obj as any).wasLookahead = true
	// })

	const previousPartEndState2 = previousPartEndState as PartEndStateExt | undefined
	copyPreviousLawoLevels(
		context,
		timeline,
		previousPartEndState2 ? previousPartEndState2.stickyLawoLevels : {},
		resolvedPieces
	)

	const persistentState: TimelinePersistentStateExt = {
		activeMediaPlayers: {}
	}
	const previousPersistentState2 = previousPersistentState as TimelinePersistentStateExt | undefined

	const config = parseConfig(context)

	persistentState.activeMediaPlayers = assignMediaPlayers(
		context,
		config,
		timeline,
		previousPersistentState2 ? previousPersistentState2.activeMediaPlayers : {},
		resolvedPieces
	)

	return Promise.resolve({
		timeline,
		persistentState
	})
}

export function preservePieceLawoLevel(
	endState: PartEndStateExt,
	previousPartEndState: Partial<PartEndStateExt> | undefined,
	piece: IBlueprintPieceDB
) {
	const metaData = piece.metaData as PieceMetaData | undefined
	if (metaData) {
		// Loop through rm level persistance
		if (metaData.stickyLawoLevels) {
			for (const key of Object.keys(metaData.stickyLawoLevels)) {
				const values = metaData.stickyLawoLevels[key]

				// Follow the previous state, if specified, or start with this exposed value
				endState.stickyLawoLevels[key] =
					values.followsPrevious &&
					previousPartEndState &&
					previousPartEndState.stickyLawoLevels &&
					previousPartEndState.stickyLawoLevels[key]
						? previousPartEndState.stickyLawoLevels[key]
						: values.value
			}
		}
	}
}

function forEachOfType<T extends TSRTimelineObjBase>(
	timelineObjs: TSRTimelineObjBase[],
	filter: (obj: Partial<T>) => boolean | undefined,
	func: (obj: T) => void
) {
	_.each(timelineObjs, obj => {
		const obj2 = obj as T
		if (filter(obj2)) {
			func(obj2)
		}
	})
}

function isLawoSource(obj: Partial<TimelineObjLawoSource & TimelineObjectCoreExt>) {
	return (
		obj.content && obj.content.deviceType === DeviceType.LAWO && obj.content.type === TimelineContentTypeLawo.SOURCE
	)
}

export function validateNoraPreload(timelineObjs: OnGenerateTimelineObj[]) {
	const toRemoveIds: string[] = []
	forEachOfType<TimelineObjHTTPRequest & TimelineObjectCoreExt>(
		timelineObjs,
		obj =>
			obj.isLookahead &&
			obj.content &&
			obj.content.deviceType === DeviceType.HTTPSEND &&
			obj.content.type === TimelineContentTypeHTTP.POST,
		httpObj => {
			// ignore normal objects
			if (
				httpObj.content.params &&
				httpObj.content.params.template &&
				httpObj.content.params.template.event === 'take'
			) {
				httpObj.content.params.template.event = 'cue'
			} else {
				// something we don't understand, so dont lookahead on it
				if (!httpObj.id) {
					httpObj.id = 'fake_obj_to_be_removed'
				}
				toRemoveIds.push(httpObj.id)
			}
		}
	)

	return timelineObjs.filter(o => toRemoveIds.indexOf(o.id) === -1)
}

export function copyPreviousLawoLevels(
	context: RundownContext,
	timelineObjs: OnGenerateTimelineObj[],
	previousLevels: PartEndStateExt['stickyLawoLevels'],
	resolvedPieces: IBlueprintPieceDB[]
) {
	// This needs to look at previous pieces within the part, to make it work for adlibs
	const lawoObjs = (timelineObjs as Array<TimelineObjLawoSource & TimelineBlueprintExt & OnGenerateTimelineObj>).filter(
		isLawoSource
	)

	// Pieces should be ordered, we shall assume that
	const groupedPieces = _.groupBy(resolvedPieces, p => p.enable.start)
	_.each(groupedPieces, pieces => {
		const pieceIds = _.map(pieces, p => p._id) // getPieceGroupId(p._id))
		// Find all the objs that start here
		const objs = lawoObjs.filter(o => {
			const groupId = o.pieceId
			return groupId && pieceIds.indexOf(groupId) !== -1
		})
		// Stop if no objects
		if (objs.length === 0 || !pieces[0].enable) {
			return
		}

		// Find the active pieces before this time
		const time = pieces[0].enable.start as number

		// Start of part
		if (time !== 0) {
			// Calculate the previous 'state'
			const activePieces = _.filter(resolvedPieces, p => {
				if (!p.enable) {
					return false
				}

				const start = p.enable.start as number // Core should be always setting this to a number
				const duration = p.playoutDuration

				// Piece must start before target, and end at or after target starts
				return start < time && (duration === undefined || start + duration >= time)
			})

			const newPreviousLevels: PartEndStateExt['stickyLawoLevels'] = {}
			_.each(activePieces, piece => {
				const metadata = piece.metaData as PieceMetaData | undefined
				if (metadata && metadata.stickyLawoLevels) {
					_.each(metadata.stickyLawoLevels, (val, id) => {
						if (newPreviousLevels[id]) {
							context.warning('duplicate level, going with the first!')
						} else {
							if (val.followsPrevious && previousLevels[id]) {
								newPreviousLevels[id] = previousLevels[id]
							} else {
								newPreviousLevels[id] = val.value
							}
						}
					})
				}
			})

			// Apply newly calculated levels
			previousLevels = newPreviousLevels
		}

		// Apply newly calculated levels
		_.each(objs, lawoObj => {
			// Persist the level, if lawo is not 'muted'
			const contentObj = lawoObj.content['Fader/Motor dB Value']
			const previousVal = previousLevels[lawoObj.layer + '']
			if (contentObj && previousVal !== undefined && lawoObj.metaData && lawoObj.metaData.lawoPersistLevel) {
				contentObj.value = previousVal
			}
		})
	})
}
