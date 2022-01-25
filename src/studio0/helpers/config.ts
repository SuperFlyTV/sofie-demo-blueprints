import { IStudioContext, IStudioUserContext } from '@sofie-automation/blueprints-integration'

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

export interface StudioConfig {
	visionMixerType: VisionMixerType

	atemSources: {
		input: number
		type: SourceType
	}[]
	atemOutputs: {
		output: number // aux number, needs a mapping
		source: number
	}[]

	vmixSources: {
		input: number
		type: SourceType
	}[]

	sisyfosSources: {
		source: number
		type: AudioSourceType
	}[]

	previewRenderer?: string
	casparcgLatency: number
}

export function getStudioConfig(context: IStudioUserContext | IStudioContext) {
	return context.getStudioConfig() as StudioConfig
}
