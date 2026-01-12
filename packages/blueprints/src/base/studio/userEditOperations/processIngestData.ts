import {
	DefaultUserOperationEditProperties,
	DefaultUserOperationRetimePiece,
	DefaultUserOperations,
	DefaultUserOperationsTypes,
	IngestChangeType,
	IngestRundown,
	IProcessIngestDataContext,
	MutableIngestRundown,
	NrcsIngestChangeDetails,
	UserOperationChange,
	UserOperationTarget,
} from '@sofie-automation/blueprints-integration'
import {
	BlueprintMutableIngestRundown,
	BlueprintsUserOperationLockSegment,
	BlueprintsUserOperations,
	BlueprintsUserOperationUserEdited,
	BlueprintUserOperationTypes,
} from './types.js'
import { removeChangesForLockedElements } from './lockedElementsHandler.js'
import { lockedElementApplyAllowedChanges } from './lockedElementApplyAllowedChanges.js'

export async function processIngestData(
	context: IProcessIngestDataContext,
	mutableIngestRundown: MutableIngestRundown,
	nrcsIngestRundown: IngestRundown,
	previousNrcsIngestRundown: IngestRundown | undefined,
	ingestChanges: NrcsIngestChangeDetails | UserOperationChange<BlueprintsUserOperations>
): Promise<void> {
	const blueprintMutableIngestRundown = mutableIngestRundown as BlueprintMutableIngestRundown
	if (ingestChanges.source === IngestChangeType.Ingest) {
		// Match default grouping, this can be customized to group parts differently
		const groupedIngestRundown = context.groupPartsInRundownAndChanges<any, any, any>(
			nrcsIngestRundown,
			previousNrcsIngestRundown,
			ingestChanges,
			(segments) => {
				// TODO - is this needed?
				return segments
			}
		)

		const ingestChangesBeforeLockedItemRemoval = JSON.parse(JSON.stringify(groupedIngestRundown.ingestChanges))

		removeChangesForLockedElements(context, blueprintMutableIngestRundown, groupedIngestRundown)

		context.logDebug(
			`changes ${JSON.stringify(groupedIngestRundown.ingestChanges)} from ${JSON.stringify(ingestChanges)}`
		)

		await applyIngestOperation(
			context,
			blueprintMutableIngestRundown,
			groupedIngestRundown.nrcsIngestRundown,
			groupedIngestRundown.ingestChanges
		)

		lockedElementApplyAllowedChanges(
			context,
			blueprintMutableIngestRundown,
			ingestChangesBeforeLockedItemRemoval,
			groupedIngestRundown.nrcsIngestRundown
		)

		// TODO - does any work need to be done to preserve order?
	} else {
		await applyUserOperation(context, blueprintMutableIngestRundown, ingestChanges)
	}
}

async function applyIngestOperation(
	context: IProcessIngestDataContext,
	mutableIngestRundown: BlueprintMutableIngestRundown,
	nrcsIngestRundown: IngestRundown,
	ingestChanges: NrcsIngestChangeDetails
) {
	// Standard apply ingest changes
	context.defaultApplyIngestChanges(mutableIngestRundown, nrcsIngestRundown, ingestChanges, {
		transformPartPayload: (partPayload) => partPayload, // TODO: parse the MOS into a friendly structure
		transformSegmentPayload: (segmentPayload) => segmentPayload, // TODO: parse the MOS into a friendly structure
		transformRundownPayload: (rundownPayload) => rundownPayload, // TODO: parse the MOS into a friendly structure
	})
}

async function applyUserOperation(
	context: IProcessIngestDataContext,
	mutableIngestRundown: BlueprintMutableIngestRundown,
	changes: UserOperationChange<BlueprintsUserOperations | DefaultUserOperations>
) {
	context.logWarning('Execute user operation: ' + JSON.stringify(changes, null, 2))

	switch (changes.operation.id) {
		case BlueprintUserOperationTypes.CHANGE_SOURCE:
			changeSource(context, mutableIngestRundown, changes)
			break
		case BlueprintUserOperationTypes.LOCK_SEGMENT_NRCS_UPDATES:
			segmentNrcsLock(context, mutableIngestRundown, changes.operationTarget, changes.operation)
			break
		case BlueprintUserOperationTypes.USER_EDITED:
			undoUserEdits(context, mutableIngestRundown, changes.operationTarget, changes.operation)
			break
		case DefaultUserOperationsTypes.REVERT_SEGMENT:
			undoUserEdits(context, mutableIngestRundown, changes.operationTarget, changes.operation)
			break
		// Update changes from properties panel:
		case DefaultUserOperationsTypes.UPDATE_PROPS:
			processUpdateProps(context, mutableIngestRundown, changes.operationTarget, changes)
			break
		// Handle drag and drop retime operations:
		case DefaultUserOperationsTypes.RETIME_PIECE:
			processRetimePiece(context, mutableIngestRundown, changes.operationTarget, changes)
			break
		default:
			context.logWarning(`Unknown operation: ${changes.operation.id}`)
	}
}

/**
 * Process piece retiming operations from the UI.
 *
 * This function handles drag-and-drop retime operations from the Sofie UI.
 *
 * It updates the piece timing in the ingest data structure based on the new inPoint provided and
 * locks the segment/part to prevent NRCS updates.
 *
 * @param context - The ingest data processing context
 * @param mutableIngestRundown - The mutable rundown being processed
 * @param operationTarget - Target containing partExternalId and pieceExternalId
 * @param changes - The user operation change containing timing information
 */
function processRetimePiece(
	context: IProcessIngestDataContext,
	mutableIngestRundown: BlueprintMutableIngestRundown,
	operationTarget: UserOperationTarget,
	changes: UserOperationChange<BlueprintsUserOperations | DefaultUserOperations>
) {
	// Extract piece timing information from the operation
	const operation = changes.operation as DefaultUserOperationRetimePiece

	context.logDebug('Processing piece retime operation: ' + JSON.stringify(changes, null, 2))

	// Ensure we have the required identifiers
	if (!operationTarget.partExternalId || !operationTarget.pieceExternalId) {
		context.logError('Retime piece operation missing part or piece external ID')
		return
	}

	// Find the part containing the piece
	const partAndSegment = mutableIngestRundown.findPartAndSegment(operationTarget.partExternalId)
	const { part, segment } = partAndSegment || {}

	if (!part?.payload) {
		context.logError(`Part not found for retime operation: ${operationTarget.partExternalId}`)
		return
	}

	if (!segment) {
		context.logError(`Segment not found for retime operation: ${operationTarget.segmentExternalId}`)
		return
	}

	// Parse the part payload to access pieces
	const partPayload: any = part.payload
	if (!partPayload.pieces || !Array.isArray(partPayload.pieces)) {
		context.logError(`Part has no pieces array: ${operationTarget.partExternalId}`)
		return
	}

	context.logDebug('Original partPayload: ' + JSON.stringify(partPayload, null, 2))

	// Find the specific piece to retime
	const pieceIndex = partPayload.pieces.findIndex((piece: any) => piece.id === operationTarget.pieceExternalId)
	if (pieceIndex === -1) {
		context.logError(`Piece not found for retime: ${operationTarget.pieceExternalId}`)
		return
	}

	const piece = partPayload.pieces[pieceIndex]
	const originalTime = piece.objectTime || 0

	// Extract new timing from operation payload
	const payload = operation.payload || {}

	// Example payload structure for retime operations:
	// 	"payload": {
	//   "segmentExternalId": "d26d22e2-4f4e-4d31-a0ca-de6f37ff9b3f",
	//   "partExternalId": "42077925-8d15-4a5d-abeb-a445ccee2984",
	//   "inPoint": 1061.4136732329084
	// }

	// Handle different retime operation types
	if (payload.inPoint === undefined) {
		context.logError('Retime piece operation missing inPoint in payload')
		return
	}

	// Check if there are any unknown values in the payload that need to be handled apart from inPoint, segmentExternalId, partExternalId
	const knownKeys = new Set(['inPoint', 'segmentExternalId', 'partExternalId'])
	const unknownKeys = Object.keys(payload).filter((key) => !knownKeys.has(key))
	if (unknownKeys.length > 0) {
		context.logWarning(`Retime piece operation has unknown keys in payload: ${unknownKeys.join(', ')}`)
	}

	// Validate piece timing against part boundaries
	// Require at least 1 second overlap with the part
	// Note: ingest payload uses seconds, but UI inPoint is in milliseconds
	const MIN_OVERLAP_S = 1
	const partDurationS = partPayload.duration || 0 // Part duration in seconds (ingest format)
	const pieceDurationS = piece.duration || 0 // Piece duration in seconds (ingest format)
	let newTime = payload.inPoint / 1000 // Convert inPoint from milliseconds to seconds

	context.logDebug(
		`Retime validation: partDuration=${partDurationS}s, pieceDuration=${pieceDurationS}s, ` +
			`originalTime=${originalTime}s, newTime=${newTime}s`
	)

	// Calculate the clamping boundaries (in seconds)
	const maxStartTime = partDurationS > 0 ? partDurationS - MIN_OVERLAP_S : Infinity // Piece must start at least 1s before part ends
	const minStartTime = pieceDurationS > 0 ? MIN_OVERLAP_S - pieceDurationS : -Infinity // Piece must end at least 1s after part starts

	context.logDebug(`Clamping boundaries: minStartTime=${minStartTime}s, maxStartTime=${maxStartTime}s`)

	// Check if constraints are satisfiable
	// This can happen if partDuration + pieceDuration < 2 * MIN_OVERLAP_S
	if (minStartTime > maxStartTime) {
		context.logWarning(
			`Piece ${operationTarget.pieceExternalId} cannot be positioned to satisfy overlap constraints ` +
				`(part: ${partDurationS}s, piece: ${pieceDurationS}s). Rejecting retime.`
		)
		return
	}

	// Clamp the piece start time to valid range
	if (newTime > maxStartTime) {
		context.logWarning(
			`Piece ${operationTarget.pieceExternalId} start time (${newTime}s) clamped to ${maxStartTime}s (1 second before part end)`
		)
		newTime = maxStartTime
	}
	if (newTime < minStartTime) {
		context.logWarning(
			`Piece ${operationTarget.pieceExternalId} start time (${newTime}s) clamped to ${minStartTime}s (so piece ends at least 1 second after part start)`
		)
		newTime = minStartTime
	}

	// Check if there are actually changes to apply
	const timeDifference = Math.abs(newTime - originalTime)
	if (timeDifference < 0.005) {
		// Less than 5ms difference - consider it unchanged
		context.logDebug(
			`No significant timing changes needed for piece ${operationTarget.pieceExternalId} (${timeDifference}s difference)`
		)
		return
	}

	// Apply the retime changes to the ingest data structure
	// Note: Ingest pieces use objectTime, not enable.start
	const updatedPiece = {
		...piece,
		objectTime: newTime,
	}

	// Lock segment to prevent NRCS updates:
	segment.setUserEditState(BlueprintUserOperationTypes.LOCK_SEGMENT_NRCS_UPDATES, true)

	// Mark both segment and part as user-edited
	segment.setUserEditState(BlueprintUserOperationTypes.USER_EDITED, true)
	part.setUserEditState(BlueprintUserOperationTypes.USER_EDITED, true)

	// Update the piece in the part payload
	partPayload.pieces[pieceIndex] = updatedPiece

	// Mark the part as modified using replacePayload
	part.replacePayload(partPayload)

	// Store the retime operation as a user edit state
	// Each retime gets a unique key to ensure state changes trigger persistence
	// This is a horrible hack.
	// segment.setUserEditState(pieceRetimeKey, true)
	const pieceRetimeKey = `${operation.id}_${operationTarget.pieceExternalId}_${Date.now()}`
	part.setUserEditState(pieceRetimeKey, true)

	context.logDebug(`Marked segment and part as user-edited and created unique retime state: ${pieceRetimeKey}`)
}

function processUpdateProps(
	context: IProcessIngestDataContext,
	mutableIngestRundown: BlueprintMutableIngestRundown,
	operationTarget: UserOperationTarget,
	changes: UserOperationChange<BlueprintsUserOperations | DefaultUserOperations>
) {
	if (operationTarget.pieceExternalId) {
		return updatePieceProps(
			context,
			mutableIngestRundown,
			{ ...operationTarget, pieceExternalId: operationTarget.pieceExternalId }, // sometimes typescript is kind of dumb >.>
			changes
		)
	} else if (operationTarget.partExternalId) {
		return updatePartProps(
			context,
			mutableIngestRundown,
			{ ...operationTarget, partExternalId: operationTarget.partExternalId }, // sometimes typescript is kind of dumb >.>
			changes
		)
	} else if (operationTarget.segmentExternalId) {
		return updateSegmentProps(
			context,
			mutableIngestRundown,
			{ ...operationTarget, segmentExternalId: operationTarget.segmentExternalId }, // sometimes typescript is kind of dumb >.>
			changes
		)
	}
}

function updateSegmentProps(
	context: IProcessIngestDataContext,
	mutableIngestRundown: BlueprintMutableIngestRundown,
	operationTarget: UserOperationTarget & { segmentExternalId: string },
	changes: UserOperationChange<BlueprintsUserOperations | DefaultUserOperations>
) {
	const operation = changes.operation as DefaultUserOperationEditProperties
	const segment = mutableIngestRundown.getSegment(operationTarget.segmentExternalId)
	if (!segment) return

	const newProps = operation.payload.globalProperties

	if (newProps[BlueprintUserOperationTypes.LOCK_SEGMENT_NRCS_UPDATES] !== undefined) {
		segment.setUserEditState(
			BlueprintUserOperationTypes.LOCK_SEGMENT_NRCS_UPDATES,
			newProps[BlueprintUserOperationTypes.LOCK_SEGMENT_NRCS_UPDATES]
		)
	}

	if (newProps[BlueprintUserOperationTypes.APPROVED] !== undefined)
		segment.setUserEditState(BlueprintUserOperationTypes.APPROVED, newProps[BlueprintUserOperationTypes.APPROVED])

	context.logInfo(
		`Update segment: ${operationTarget.segmentExternalId} new props: lock=${newProps['lock']} approve=${newProps['approve']} mute=${newProps['mute']}`
	)
}

function updatePartProps(
	_context: IProcessIngestDataContext,
	mutableIngestRundown: BlueprintMutableIngestRundown,
	operationTarget: UserOperationTarget & { partExternalId: string },
	changes: UserOperationChange<BlueprintsUserOperations | DefaultUserOperations>
) {
	const operation = changes.operation as DefaultUserOperationEditProperties

	const partAndSegment = mutableIngestRundown.findPartAndSegment(operationTarget.partExternalId)
	const part = partAndSegment?.part
	const segment = partAndSegment?.segment
	_context.logDebug(
		'Update part ' +
			operationTarget.partExternalId +
			' New prop updates : ' +
			JSON.stringify(operation.payload.globalProperties)
	)
	if (!part?.payload) return

	const newProps = operation.payload.globalProperties
	// Also check for any segment properties: (e.g. locked)
	if (newProps[BlueprintUserOperationTypes.LOCK_SEGMENT_NRCS_UPDATES] !== undefined && segment) {
		segment.setUserEditState(
			BlueprintUserOperationTypes.LOCK_SEGMENT_NRCS_UPDATES,
			newProps[BlueprintUserOperationTypes.LOCK_SEGMENT_NRCS_UPDATES]
		)
	}

	// Only changes source if specified to do so
	if (Object.keys(operation.payload.pieceTypeProperties).length > 0) {
		changes.operation.id = BlueprintUserOperationTypes.CHANGE_SOURCE
		changeSource(_context, mutableIngestRundown, changes)
	}
}

function updatePieceProps(
	context: IProcessIngestDataContext,
	mutableIngestRundown: BlueprintMutableIngestRundown,
	operationTarget: UserOperationTarget & { pieceExternalId: string },
	changes: UserOperationChange<BlueprintsUserOperations | DefaultUserOperations>
) {
	const operation = changes.operation as DefaultUserOperationEditProperties

	if (!operationTarget.partExternalId) return // I'm lazy and don't feel like looking this up manually

	const part = mutableIngestRundown.findPart(operationTarget.partExternalId)
	if (!part?.payload) return

	const lifespan = operation.payload.globalProperties['lifespan']
	context.logDebug('Update piece ' + operationTarget.pieceExternalId + ': ' + lifespan)
	// TODO: Do we actually update anything here? We just seem to log.
}

function changeSource(
	context: IProcessIngestDataContext,
	mutableIngestRundown: BlueprintMutableIngestRundown,
	changes: UserOperationChange<BlueprintsUserOperations | DefaultUserOperations>
) {
	//Example of a Change source user operation:
	// {
	// 	"source":"user",
	// 	"operation":{
	// 		"id":"__sofie-update-props",
	// 	"	payload":{
	// 			"pieceTypeProperties":
	// 				{
	// 				"type":"camera",
	// 				"value":{"valueOnVariant":"4"}
	// 				},
	// 			"globalProperties":{}
	// 		}
	// 	},
	// 	"operationTarget":
	// 		{
	// 		"segmentExternalId":"bc19641d-a857-493c-a639-db0c36ed668b",
	// 		"partExternalId":"5e4ea08d-7bbb-4180-a19a-14193fb00bdd"}
	// }"

	if (
		changes.operation.id !== BlueprintUserOperationTypes.CHANGE_SOURCE ||
		changes.operationTarget.partExternalId === undefined
	) {
		return
	}

	const newSourceType = changes.operation.payload.pieceTypeProperties.type
	const newSource = changes.operation.payload.pieceTypeProperties.value.valueOnVariant
	const part = mutableIngestRundown.findPart(changes.operationTarget.partExternalId)
	if (part && part.payload) {
		const newPayload: any = JSON.parse(JSON.stringify(part.payload))
		let changed = false
		// We asume that the first piece is the primary piece
		// Which is not always the case, but for now we will assume that
		// Here's an example:
		//       "pieces": [
		// {
		// 	"id": "4a0be9fc-d820-430e-bffc-c07207db1970",
		// 	"objectType": "camera",
		// 	"objectTime": 3,
		// 	"duration": 3,
		// 	"attributes": {
		// 	  "camNo": 1,
		// 	  "adlib": false
		// 	}
		if (newPayload.pieces[0].type !== newSourceType) {
			newPayload.pieces[0].obejectType = newSourceType
			changed = true
		}

		if (newPayload.pieces[0].input !== newSource) {
			newPayload.pieces[0].attributes.camNo = newSource
			changed = true
		}
		context.logInfo(`Changed source: ${changed} = ${JSON.stringify(newPayload, undefined, 2)}`)
		if (changed) {
			// Indicate that the segment has been edited:
			mutableIngestRundown.setUserEditState(BlueprintUserOperationTypes.USER_EDITED, true)
			// Lock the segment to prevent NRCS updates:
			mutableIngestRundown.setUserEditState(BlueprintUserOperationTypes.LOCK_SEGMENT_NRCS_UPDATES, true)
			// Update the payload:
			//partProps.replacePayload(newPayload)
		}
		part.replacePayload(newPayload)
	}
}

function segmentNrcsLock(
	context: IProcessIngestDataContext,
	mutableIngestRundown: BlueprintMutableIngestRundown,
	operationTarget: UserOperationTarget,
	operation: BlueprintsUserOperationLockSegment
) {
	if (!operationTarget.segmentExternalId) return

	const segment = mutableIngestRundown.getSegment(operationTarget.segmentExternalId)
	if (!segment) return

	const newLockedState = !segment.userEditStates[operation.id]

	segment.setUserEditState(operation.id, newLockedState)
	context.logInfo(`Lock segment: ${operationTarget.segmentExternalId} new state: ${newLockedState}`)
}

function undoUserEdits(
	context: IProcessIngestDataContext,
	mutableIngestRundown: BlueprintMutableIngestRundown,
	operationTarget: UserOperationTarget,
	operation: BlueprintsUserOperationUserEdited | DefaultUserOperations
) {
	if (!operationTarget.segmentExternalId) return

	const segment = mutableIngestRundown.getSegment(operationTarget.segmentExternalId)
	if (!segment) return

	// Unlock the segment to allow NRCS updates:
	segment.setUserEditState(BlueprintUserOperationTypes.LOCK_SEGMENT_NRCS_UPDATES, false)
	//ToDo: At the moment this will only undo it on the next MOS update
	// Should be updated instantly but re-running the processIngestData?
	context.logInfo(`Undo userEdits: ${operationTarget.segmentExternalId}`)
	segment.setUserEditState(operation.id, false)
}
