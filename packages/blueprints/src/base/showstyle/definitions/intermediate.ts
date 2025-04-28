export interface IntermediatePart {
	type: string | null
	payload: any
}

export interface IntermediateSegment {
	type: string | null
	parts: IntermediatePart[]
	payload: any
}
