import { IStudioContext, IStudioUserContext } from '@sofie-automation/blueprints-integration'
import { StudioConfig as StudioConfig0 } from '../../../$schemas/generated/main-studio-config'

export enum VisionMixerType {
	Atem = 'atem',
	VMix = 'vmix',
}

export enum SourceType {
	Camera = 'camera',
	Remote = 'remote',
	MediaPlayer = 'mediaplayer',
	Graphics = 'graphics',
	MultiView = 'multiview',
}

export enum AudioSourceType {
	Host = 'host',
	Guest = 'guest',
	Remote = 'remote',
	Playback = 'playback',
	// FX?
}

export interface BlueprintConfig {
	studio: StudioConfig
}

export type StudioConfig = StudioConfig0

export function getStudioConfig(context: IStudioUserContext | IStudioContext): StudioConfig {
	return context.getStudioConfig() as StudioConfig
}
