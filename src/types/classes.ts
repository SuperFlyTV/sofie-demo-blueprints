import { SegmentContext, SourceLayerType } from 'tv-automation-sofie-blueprints-integration'
import { BlueprintConfig } from '../blueprint0/helpers/config'
import { SourceInfo } from '../blueprint0/helpers/sources'

export enum ObjectType {
	GRAPHIC = 'graphic',
	VIDEO = 'video',
	CAMERA = 'camera',
	SPLIT = 'split',
	OVERLAY = 'overlay',
	LIGHTS = 'lights',
	TRANSITION = 'transition',
	REMOTE = 'remote',
	PIP = 'pip',
	VOICEOVER = 'voiceover',
	SCRIPT = 'script'
}

export interface Piece { // TODO: Customize
	id: string
	objectType: ObjectType
	objectTime: number
	duration: number
	clipName: string
	attributes: any
	position: string
	script?: string
	transition?: string
}

export interface SegmentConf {
	context: SegmentContext
	config: BlueprintConfig
	sourceConfig: SourceInfo[]
	frameHeight: number
	frameWidth: number
	framesPerSecond: number
}

export interface PieceParams {
	config: SegmentConf
	piece: Piece
	context: string
}

export interface SourceMeta {
	type: SourceLayerType
	studioLabel: string
	switcherInput: number | string
}
