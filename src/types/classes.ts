import { SegmentContext, SourceLayerType } from 'tv-automation-sofie-blueprints-integration'
import { BlueprintConfig } from '../tv2_afvd_showstyle/helpers/config'
import { SourceInfo } from '../tv2_afvd_showstyle/helpers/sources'

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
	duration: number
	clipName: string
	position: string
	script?: string
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
