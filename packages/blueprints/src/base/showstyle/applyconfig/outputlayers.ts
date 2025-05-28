import { IOutputLayer } from '@sofie-automation/blueprints-integration'
import { OutputLayer } from './layers.js'

export function getOutputLayer(): IOutputLayer[] {
	const layers = [
		{
			_id: OutputLayer.Gfx,
			name: 'GFX',
			_rank: 75,
			isPGM: false,
			isDefaultCollapsed: true,
		},
		{
			_id: OutputLayer.Pgm,
			name: 'PGM',
			_rank: 100,
			isPGM: true,
			isFlattened: true,
		},
		{
			_id: OutputLayer.Aux,
			name: 'Aux',
			_rank: 150,
			isPGM: false,
			isFlattened: false,
			isDefaultCollapsed: true,
		},
		{
			_id: OutputLayer.Script,
			name: 'Script',
			_rank: 200,
			isPGM: false,
			isFlattened: false,
		},
	]
	return layers
}
