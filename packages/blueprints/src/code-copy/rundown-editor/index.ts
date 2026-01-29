import { IngestPart, IngestSegment } from '@sofie-automation/blueprints-integration'

export interface EditorIngestRundown {
	externalId: string
	name: string // namnet på sheeten
	expectedStart: number // unix time
	expectedEnd: number // unix time
}

export interface DecoratedEditorIngestSegment extends IngestSegment {
	payload: EditorIngestSegment
}
export interface EditorIngestSegment {
	rundownId: string
	externalId: string // unique within the parent runningOrder
	rank: number
	name: string
	float: boolean
	type: string
}

export interface DecoratedEditorIngestPart extends IngestPart {
	payload: EditorIngestPart
}
export interface EditorIngestPart {
	segmentId: string
	externalId: string // unique within the parent section
	rank: number
	name: string
	type: string //  Assume we want this
	duration?: number
	// type: string
	float: boolean
	script: string

	pieces: EditorIngestPiece[]
}

export interface EditorIngestPiece {
	id: string
	name?: string // hacky, we need to make it optional, since it's being cast as spreadsheet types in some parts of the code. We need a bigger refactor!!
	objectType: string
	objectTime: number
	duration: number
	clipName: string
	attributes: {
		[key: string]: string | number | boolean | undefined
	}
	script?: string
	transition?: string
}
