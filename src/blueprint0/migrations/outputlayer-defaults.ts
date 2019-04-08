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
	}
])
