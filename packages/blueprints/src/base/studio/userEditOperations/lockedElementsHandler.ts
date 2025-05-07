import {
	GroupPartsInMosRundownAndChangesResult,
	IngestSegment,
	IProcessIngestDataContext,
	NrcsIngestPartChangeDetails,
	NrcsIngestSegmentChangeDetails,
	NrcsIngestSegmentChangeDetailsEnum,
	NrcsIngestSegmentChangeDetailsObject,
} from '@sofie-automation/blueprints-integration'
import {
	BlueprintMutableIngestPart,
	BlueprintMutableIngestRundown,
	BlueprintMutableIngestSegment,
	BlueprintUserOperationTypes,
} from './types.js'

export function removeChangesForLockedElements(
	context: IProcessIngestDataContext,
	mutableIngestRundown: BlueprintMutableIngestRundown,
	groupedIngestRundown: GroupPartsInMosRundownAndChangesResult
): void {
	const allSegmentChanges = groupedIngestRundown.ingestChanges.segmentChanges
	if (!allSegmentChanges) return

	for (const [segmentId, segmentChange] of Object.entries<NrcsIngestSegmentChangeDetails>(allSegmentChanges)) {
		if (!segmentChange) continue

		const nrcsSegment = groupedIngestRundown.nrcsIngestRundown.segments.find((s) => s.externalId === segmentId)

		// Find the current version of the segment
		const mutableSegment = mutableIngestRundown.getSegment(segmentId)
		// TODO - consider externalId changes, or will openmedia never trigger those?
		if (!mutableSegment) continue

		// If the segment is locked, discard any changes
		if (mutableSegment.userEditStates[BlueprintUserOperationTypes.LOCK_SEGMENT_NRCS_UPDATES]) {
			const locked = mutableSegment.userEditStates[BlueprintUserOperationTypes.LOCK_SEGMENT_NRCS_UPDATES] ?? false

			if (locked) {
				context.logInfo(
					`CHANGE SEGMENT: ${mutableSegment.name}  ID: ${mutableSegment.externalId} are Locked and won't be update from NRCS`
				)
				delete allSegmentChanges[segmentId]
			}
		} else {
			// Check for any locked parts, and reject any changes to them
			recalculateSegmentChangesFromLockedParts(
				allSegmentChanges,
				segmentChange,
				mutableSegment as BlueprintMutableIngestSegment,
				nrcsSegment
			)
		}
	}
}

function recalculateSegmentChangesFromLockedParts(
	allSegmentChanges: Record<string, NrcsIngestSegmentChangeDetails>,
	segmentChange: NrcsIngestSegmentChangeDetails,
	mutableSegment: BlueprintMutableIngestSegment,
	nrcsSegment: IngestSegment | undefined
) {
	const lockedPartIds = new Set<string>()
	for (const part of mutableSegment.parts) {
		if (part.userEditStates[BlueprintUserOperationTypes.LOCK_PART_NRCS_UPDATES]) lockedPartIds.add(part.externalId)
	}

	// Stop early if no parts are locked
	if (lockedPartIds.size === 0) return

	switch (segmentChange) {
		case NrcsIngestSegmentChangeDetailsEnum.Deleted: {
			const newChanges = createNewChangesObjectForDeletedSegmentWithLockedParts(mutableSegment)
			if (newChanges) {
				allSegmentChanges[mutableSegment.externalId] = newChanges
			} else {
				delete allSegmentChanges[mutableSegment.externalId]
			}

			break
		}
		case NrcsIngestSegmentChangeDetailsEnum.InsertedOrUpdated: {
			// If there is no nrcs segment, it shouldn't be reported as InsertedOrUpdated
			if (!nrcsSegment) break

			allSegmentChanges[mutableSegment.externalId] = createNewChangesObjectForUpsertedSegmentWithLockedParts(
				lockedPartIds,
				nrcsSegment,
				mutableSegment
			)

			break
		}
		default:
			removeLockedPartChangesFromSegmentChangesObject(segmentChange, mutableSegment)
			break
	}
}

function createNewChangesObjectForDeletedSegmentWithLockedParts(
	mutableSegment: BlueprintMutableIngestSegment
): NrcsIngestSegmentChangeDetails | null {
	// Segment is deleted, clear out any parts which are not locked
	const partChanges: Record<string, NrcsIngestPartChangeDetails> = {}
	for (const part of mutableSegment.parts) {
		if (!part.userEditStates[BlueprintUserOperationTypes.LOCK_PART_NRCS_UPDATES])
			partChanges[part.externalId] = NrcsIngestPartChangeDetails.Deleted
	}

	// Check if anything is pending removal
	if (Object.keys(partChanges).length > 0) {
		return {
			partOrderChanged: true,
			partChanges: partChanges,
			payloadChanged: false, // Don't clear anything about the segment itself
		}
	} else {
		// Nothing changed, so ignore
		return null
	}
}

function createNewChangesObjectForUpsertedSegmentWithLockedParts(
	lockedPartIds: Set<string>,
	nrcsSegment: IngestSegment,
	mutableSegment: BlueprintMutableIngestSegment
): NrcsIngestSegmentChangeDetails {
	const partChanges: Record<string, NrcsIngestPartChangeDetails> = {}

	// First mark any existing parts as deleted, if they still exist that will be overridden
	for (const part of mutableSegment.parts) {
		if (!part.userEditStates[BlueprintUserOperationTypes.LOCK_PART_NRCS_UPDATES])
			partChanges[part.externalId] = NrcsIngestPartChangeDetails.Deleted
	}

	for (const nrcsPart of nrcsSegment.parts) {
		if (lockedPartIds.has(nrcsPart.externalId)) continue

		// Report everything not locked as having changed, although they may not have
		partChanges[nrcsPart.externalId] = partChanges[nrcsPart.externalId]
			? NrcsIngestPartChangeDetails.Updated
			: NrcsIngestPartChangeDetails.Inserted
	}

	return {
		partOrderChanged: true,
		partChanges: partChanges,
		payloadChanged: true,
	}
}

function removeLockedPartChangesFromSegmentChangesObject(
	segmentChange: NrcsIngestSegmentChangeDetailsObject,
	_mutableSegment: BlueprintMutableIngestPart
): void {
	// If no specific part changes, there is nothing to undo
	if (!segmentChange.partChanges) return

	for (const [partId, partChanges] of Object.entries<NrcsIngestPartChangeDetails>(segmentChange.partChanges)) {
		if (!partChanges) continue

		// Todo - check if the part is locked:
		// Find the current version of the segment:
		//		const mutablePart = mutableSegment.getPart(partId)
		//		if (!mutablePart) continue

		// Check if it is locked:
		//		if (!mutablePart.userEditStates[BlueprintUserOperationTypes.LOCK_PART_NRCS_UPDATES]) continue

		// Make sure there are no pending changes
		delete segmentChange.partChanges[partId]
	}
}
