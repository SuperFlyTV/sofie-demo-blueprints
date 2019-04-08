import { IBlueprintRuntimeArgumentsItem } from 'tv-automation-sofie-blueprints-integration'
import { literal } from '../../common/util'

export default literal<IBlueprintRuntimeArgumentsItem[]>([
	{
		_id: 'x-mix-10',
		label: 'Dissolve 10f',
		hotkeys: 'x',
		property: 'transition-mix',
		value: '10'
	}
])
