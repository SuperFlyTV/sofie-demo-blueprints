import { IOutputLayer } from '@sofie-automation/blueprints-integration'
import { literal } from '../../common/util'
import { OutputLayer } from '../layers'

export default literal<IOutputLayer[]>([
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
		_id: OutputLayer.Script,
		name: 'Script',
		_rank: 200,
		isPGM: false,
		isFlattened: false,
	},
])
