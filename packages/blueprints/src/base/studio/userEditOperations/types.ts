import { MutableIngestPart, MutableIngestRundown, MutableIngestSegment } from '@sofie-automation/blueprints-integration'

export interface BlueprintMutableIngestRundown extends MutableIngestRundown {
	_dummy_to_avoid_ts_error: string
}

export interface BlueprintMutableIngestSegment extends MutableIngestSegment {
	_dummy_to_avoid_ts_error: string
}

export interface BlueprintMutableIngestPart extends MutableIngestPart {
	_dummy_to_avoid_ts_error: string
}

export enum BlueprintUserOperationTypes {
	REVERSE_RUNDOWN = 'reverseRundown',
	CHANGE_SOURCE = 'change-source',
	MUTE_PART = 'mute-part',
	MUTE_SEGMENT = 'mute-segment',
	SEGMENT_OPERATION = 'segment-operation',
	LOCK_SEGMENT_NRCS_UPDATES = 'lock-segment-nrcs-updates',
	LOCK_PART_NRCS_UPDATES = 'lock-part-nrcs-updates',
	USER_EDITED = 'user-edited',
	APPROVED = 'approved', // This is just an example of how to use SVG icons in user operations
}

export interface BlueprintsUserOperationMuteSegment {
	id: BlueprintUserOperationTypes.MUTE_SEGMENT
}
export interface BlueprintsUserOperationMutePart {
	id: BlueprintUserOperationTypes.MUTE_PART
}
export interface BlueprintsUserOperationLockSegment {
	id: BlueprintUserOperationTypes.LOCK_SEGMENT_NRCS_UPDATES
}
export interface BlueprintsUserOperationLockPart {
	id: BlueprintUserOperationTypes.LOCK_PART_NRCS_UPDATES
}
export interface BlueprintsUserOperationUserEdited {
	id: BlueprintUserOperationTypes.USER_EDITED
}
export interface BlueprintsUserOperationApproved {
	id: BlueprintUserOperationTypes.APPROVED
}
export interface BlueprintsUserOperationChangeCamera {
	id: BlueprintUserOperationTypes.CHANGE_SOURCE
	source: Record<string, any>
}

export type BlueprintsUserOperations =
	| BlueprintsUserOperationMuteSegment
	| BlueprintsUserOperationMutePart
	| BlueprintsUserOperationLockSegment
	| BlueprintsUserOperationLockPart
	| BlueprintsUserOperationUserEdited
	| BlueprintsUserOperationApproved
	| BlueprintsUserOperationChangeCamera
