import {
	DefaultUserOperationEditProperties,
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
	context.logWarning(`Execute user operation: ${JSON.stringify(changes)}`)

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
		default:
			context.logWarning(`Unknown operation: ${changes.operation.id}`)
	}
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

		if (newPayload.type !== newSourceType) {
			newPayload.type = newSourceType
			changed = true
		}

		if (newPayload.input !== newSource) {
			newPayload.input = newSource
			changed = true
		}
		context.logInfo(`Changed source: ${changed} = ${JSON.stringify(newPayload, undefined, 4)}`)
		if (changed) {
			// Indicate that the segment has been edited:
			mutableIngestRundown.setUserEditState(BlueprintUserOperationTypes.USER_EDITED, true)
			// Lock the segment to prevent NRCS updates:
			mutableIngestRundown.setUserEditState(BlueprintUserOperationTypes.LOCK_SEGMENT_NRCS_UPDATES, true)
			// Update the payload:
			//partProps.replacePayload(newPayload)
		}
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
