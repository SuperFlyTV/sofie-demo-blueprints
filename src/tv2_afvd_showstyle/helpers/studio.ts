import { SegmentContext } from 'tv-automation-sofie-blueprints-integration'

/**
 * Gets the name of the studio this context belongs to.
 * @param {SegmentContext} context Context to find the studio name for.
 */
export function getStudioName(context: SegmentContext) {
	const studio = (context as any).studio

	if (studio) {
		return studio.name
	}

	return ''
}
