import { IOutputLayer } from 'tv-automation-sofie-blueprints-integration'
import { literal } from '../../common/util'

export default literal<IOutputLayer[]>([
	{
		_id: 'pgm0',
		name: 'PGM',
		isPGM: true,
		_rank: 0
	},
	{
		_id: 'monitor0',
		name: 'BAK',
		isPGM: false,
		_rank: 1
	},
	{
		_id: 'screen1',
		name: 'Screen 1',
		isPGM: false,
		_rank: 2
	},
	{
		_id: 'screen2',
		name: 'Screen 2',
		isPGM: false,
		_rank: 2
	}
	,
	{
		_id: 'screen3',
		name: 'Screen 3',
		isPGM: false,
		_rank: 2
	}
])
