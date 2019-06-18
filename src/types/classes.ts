import { SegmentContext } from 'tv-automation-sofie-blueprints-integration'
import { BlueprintConfig } from '../blueprint0/helpers/config'
import { SourceInfo } from '../blueprint0/helpers/sources'

export interface Piece {
	id: string
	objectType: string // TODO: Enum?
	objectTime: number
	duration: number
	clipName: string
	attributes: any
	position: string
	script?: string
}

export interface BoxProps {
	x: number
	y: number
	size: number
}

export interface SegmentConf {
	context: SegmentContext,
	config: BlueprintConfig
	sourceConfig: SourceInfo[]
}
