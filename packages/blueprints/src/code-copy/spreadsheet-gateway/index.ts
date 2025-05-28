import { IngestPart, IngestSegment } from '@sofie-automation/blueprints-integration'

export interface SpreadsheetIngestRundown {
	externalId: string
	name: string // namnet på sheeten
	expectedStart: number // unix time
	expectedEnd: number // unix time
}

export interface DecoratedSpreadsheetIngestSegment extends IngestSegment {
	payload: SpreadsheetIngestSegment
}
export interface SpreadsheetIngestSegment {
	rundownId: string
	externalId: string // unique within the parent runningOrder
	rank: number
	name: string
	float: boolean
}

export interface DecoratedSpreadsheetIngestPart extends IngestPart {
	payload: SpreadsheetIngestPart
}
export interface SpreadsheetIngestPart {
	segmentId: string
	externalId: string // unique within the parent section
	rank: number
	name: string
	type: string //  Assume we want this
	// type: string
	float: boolean
	script: string

	pieces: SpreadsheetIngestPiece[]
}

export interface SpreadsheetIngestPiece {
	id: string
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
