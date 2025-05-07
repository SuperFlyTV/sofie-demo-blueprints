import {
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
	BlueprintsUserOperationLockPart,
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

	const operation = changes.operation
	switch (operation.id) {
		case BlueprintUserOperationTypes.CHANGE_SOURCE:
			changeSource(context, mutableIngestRundown, changes)
			break
		case BlueprintUserOperationTypes.LOCK_SEGMENT_NRCS_UPDATES:
			segmentNrcsLock(context, mutableIngestRundown, changes.operationTarget, operation)
			break
		case BlueprintUserOperationTypes.LOCK_PART_NRCS_UPDATES:
			partNrcsLock(context, mutableIngestRundown, changes.operationTarget, operation)
			break
		case BlueprintUserOperationTypes.USER_EDITED:
			undoUserEdits(context, mutableIngestRundown, changes.operationTarget, operation)
			break
		case DefaultUserOperationsTypes.REVERT_SEGMENT:
			undoUserEdits(context, mutableIngestRundown, changes.operationTarget, operation)
			break
		default:
			context.logWarning(`Unknown operation: ${changes.operation.id}`)
	}
}

function changeSource(
	context: IProcessIngestDataContext,
	mutableIngestRundown: BlueprintMutableIngestRundown,
	changes: UserOperationChange<BlueprintsUserOperations | DefaultUserOperations>
) {
	if (
		changes.operation.id !== BlueprintUserOperationTypes.CHANGE_SOURCE ||
		!changes.operationTarget.segmentExternalId
	) {
		return
	}

	const [[newSourceType]] = Object.entries<Record<string, string>>(changes.operation.source)
	const newSource = changes.operation.source[newSourceType]

	const segment = mutableIngestRundown.getSegment(changes.operationTarget.segmentExternalId)
	context.logInfo(`segment: ${JSON.stringify(segment, undefined, 4)}`)
	const partProps = segment?.parts?.[0] // TODO - better searching
	context.logInfo(`searching: ${segment?.parts?.map((s) => s.externalId).join(' / ')}`)
	context.logInfo(`part: ${JSON.stringify(partProps, undefined, 4)}`)
	if (partProps && partProps.payload) {
		const newPayload: any = JSON.parse(JSON.stringify(partProps.payload))
		let changed = false

		for (const item of newPayload?.Body ?? []) {
			if (item.Type !== 'storyItem') continue
			item.Content.Slug = newSource
			for (const metadata of item.Content.MosExternalMetaData ?? []) {
				if (
					metadata.MosPayload &&
					'mosarttemplate' in metadata.MosPayload &&
					metadata.MosPayload.mosarttemplate?.type?.attributes?.name === 'CAMERA'
				) {
					metadata.MosPayload.mosarttemplate.type.variants.attributes.value = newSource
					metadata.MosPayload.mosarttemplate.type.variants.variant.attributes.name = newSource

					changed = true
				}
			}
		}
		context.logInfo(`changed: ${changed} = ${JSON.stringify(newPayload, undefined, 4)}`)
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

	// TODO: for this to work it needs to be copied from the nrcsIngestRundown too
	// // Force it to be regenerated
	// if (!newLockedState) segment.forceRegenerate()
}

function partNrcsLock(
	context: IProcessIngestDataContext,
	mutableIngestRundown: BlueprintMutableIngestRundown,
	operationTarget: UserOperationTarget,
	operation: BlueprintsUserOperationLockPart
) {
	if (!operationTarget.partExternalId) return

	const part = mutableIngestRundown.findPart(operationTarget.partExternalId)
	if (!part) return

	part.setUserEditState(operation.id, !part.userEditStates[operation.id])
	context.logInfo(`Lock part: ${operationTarget.partExternalId} new state: ${part.userEditStates[operation.id]}`)
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
