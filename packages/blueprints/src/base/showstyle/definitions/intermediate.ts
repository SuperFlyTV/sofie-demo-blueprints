export interface IntermediatePart {
	type: string | null
	payload: any
	userEditStates?: Record<string, boolean>
}

export interface IntermediateSegment {
	type: string | null
	parts: IntermediatePart[]
	payload: any
	userEditStates?: Record<string, boolean>
}
