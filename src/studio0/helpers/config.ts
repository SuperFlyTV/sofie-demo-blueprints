export enum AtemSourceType {
	Camera = 'camera',
	Remote = 'remote',
	MediaPlayer = 'mediaplayer',
	Graphics = 'graphics',
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
}
