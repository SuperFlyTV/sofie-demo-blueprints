import { IStudioContext, IStudioUserContext } from '@sofie-automation/blueprints-integration'

export enum AtemSourceType {
	Camera = 'camera',
	Remote = 'remote',
	MediaPlayer = 'mediaplayer',
	Graphics = 'graphics',
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
	atemSources: {
		input: number
		type: AtemSourceType
	}[]
	atemOutputs: {
		output: number // aux number, needs a mapping
		source: number
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
