import { IActionExecutionContext, IBlueprintResolvedPieceInstance } from '@sofie-automation/blueprints-integration'

export async function getResolvedCurrentlyPlayingPieceInstances(
	context: IActionExecutionContext
): Promise<IBlueprintResolvedPieceInstance[]> {
	const now = context.getCurrentTime()
	return (
		(await context.getResolvedPieceInstances('current'))
			// Ensure the order is unchanged:
			.sort((a, b) => {
				if (a._id > b._id) return 1
				if (a._id < b._id) return -1
				return 0
			})
			.filter((pi) => {
				// Check that this piece is active
				if (pi.resolvedStart > now) return false
				if (pi.resolvedDuration) {
					const resolvedEnd = pi.resolvedStart + pi.resolvedDuration
					if (resolvedEnd < now) return false
				}
				return true
			})
	)
}
