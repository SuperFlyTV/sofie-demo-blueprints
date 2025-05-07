import {
	IngestRundown,
	IngestSegment,
	IProcessIngestDataContext,
	MutableIngestRundown,
	MutableIngestSegment,
	NrcsIngestChangeDetails,
	NrcsIngestPartChangeDetails,
	NrcsIngestSegmentChangeDetails,
	NrcsIngestSegmentChangeDetailsEnum,
} from '@sofie-automation/blueprints-integration'
import { BlueprintMutableIngestPart, BlueprintUserOperationTypes } from './types.js'

/**
 * If a Segment or Part is locked, it can still be possible to update parts of it.
 * E.g. We wan't to udate the script from NRCS, but keep the rest of the part locked.
 * */
export function lockedElementApplyAllowedChanges(
	_context: IProcessIngestDataContext,
	mutableIngestRundown: MutableIngestRundown,
	rawIngestChanges: NrcsIngestChangeDetails,
	ingestRundown: IngestRundown
): void {
	if (!rawIngestChanges.segmentChanges) return

	for (const [segmentId, segmentChange] of Object.entries<NrcsIngestSegmentChangeDetails | undefined>(
		rawIngestChanges.segmentChanges
	)) {
		if (!segmentChange) continue

		const mutableSegment = mutableIngestRundown.getSegment(segmentId)
		if (!mutableSegment) continue

		const nrcsSegment = ingestRundown.segments.find((s) => s.externalId === segmentId)
		if (!nrcsSegment) continue

		switch (segmentChange) {
			case NrcsIngestSegmentChangeDetailsEnum.Deleted:
				// No updated script to copy
				break

			case NrcsIngestSegmentChangeDetailsEnum.InsertedOrUpdated: {
				// If there is no nrcs segment, it shouldn't be reported as InsertedOrUpdated
				if (!nrcsSegment) break

				// Check all parts
				for (const part of mutableSegment.parts) {
					updatePartIfLocked(mutableSegment, nrcsSegment, part as BlueprintMutableIngestPart)
				}

				break
			}
			default:
				// TODO - does this need to consider whether the segment payload changed? It looks like probably not for how openmedia stories are converter

				if (!segmentChange.partChanges) break

				for (const [partId, partChanges] of Object.entries<NrcsIngestPartChangeDetails>(segmentChange.partChanges)) {
					if (!partChanges) continue

					// Ignore deletion
					if (partChanges === NrcsIngestPartChangeDetails.Deleted) continue

					// Find the current version of the segment
					const mutablePart = mutableSegment.getPart(partId)
					if (!mutablePart) return

					updatePartIfLocked(mutableSegment, nrcsSegment, mutablePart as BlueprintMutableIngestPart)
				}

				break
		}
	}
}

function updatePartIfLocked(
	mutableSegment: MutableIngestSegment,
	nrcsSegment: IngestSegment,
	mutablePart: BlueprintMutableIngestPart
) {
	if (!mutablePart.payload) return

	const partId = mutablePart.externalId

	// Find the part in the nrcs rundown, to copy the script from
	const nrcsPart = nrcsSegment.parts.find((p) => p.externalId === partId)
	if (!nrcsPart) return

	// Skip if it is not locked, the part will have been updated through the normal route
	if (
		!mutableSegment.userEditStates[BlueprintUserOperationTypes.LOCK_SEGMENT_NRCS_UPDATES] &&
		!mutablePart.userEditStates[BlueprintUserOperationTypes.LOCK_PART_NRCS_UPDATES]
	)
		return

	// Here it's possible to have e.g. the script or filename changed in NRCS
	// and updated, while the rest of the part is locked
}
