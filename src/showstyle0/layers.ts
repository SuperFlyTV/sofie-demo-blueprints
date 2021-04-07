export enum SourceLayer {
	Titles = 'opener',
	Camera = 'cam',
	Remote = 'remote',
	VT = 'vt',
	VO = 'vo',
	DVE = 'dve',
	GFX = 'gfx',

	AudioBed = 'audioBed',

	LowerThird = 'lower_third',
	Strap = 'strap',
	Ticker = 'ticker',

	Script = 'script',
}

export enum OutputLayer {
	Gfx = 'gfx',
	Pgm = 'pgm',
	Aux = 'aux',
	Script = 'script',
}

export function getOutputLayerForSourceLayer(layer: SourceLayer): OutputLayer {
	switch (layer) {
		case SourceLayer.Script:
			return OutputLayer.Script
		case SourceLayer.LowerThird:
		case SourceLayer.Strap:
		case SourceLayer.Ticker:
			return OutputLayer.Gfx
		case SourceLayer.AudioBed:
			return OutputLayer.Aux
		default:
			return OutputLayer.Pgm
	}
}
