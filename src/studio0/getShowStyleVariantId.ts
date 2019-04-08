import { MOS, IStudioContext } from 'tv-automation-sofie-blueprints-integration'
import * as _ from 'underscore'

export function getShowStyleVariantId (context: IStudioContext, _story: MOS.IMOSRunningOrder): string | null {
	const showStyles = context.getShowStyleBases()

	// TODO - select better
	const show = _.first(showStyles)

	if (show) {
		const variants = context.getShowStyleVariants(show._id)
		// TODO - select better
		const variant = _.first(variants)

		if (variant) {
			return variant._id
		}
	}

	return null
}
