import { IOnSetAsNextContext } from '@sofie-automation/blueprints-integration'

/**
 * Called when a part is set as Next.
 * This is used to dynamically update "Coming Up" pieces with actual upcoming part data.
 */
export async function onSetAsNext(context: IOnSetAsNextContext): Promise<void> {
	try {
		// Get pieces in the next part
		const nextPart = await context.getPartInstance('next')
		if (!nextPart) {
			context.logDebug('onSetAsNext: No next part')
			return
		}

		const pieces = await context.getPieceInstances('next')
		context.logDebug(`onSetAsNext: Found ${pieces.length} pieces in next part`)

		// Find any "Coming Up" pieces (identified by template name or source layer)
		const comingUpPieces = pieces.filter((p) => {
			const timelineObjs = p.piece.content.timelineObjects as any[]
			const hasComingUpTemplate = timelineObjs?.some((obj) => obj.content?.name?.includes('coming-up'))
			const isComingUpName = p.piece.name?.toLowerCase().includes('coming up')

			context.logDebug(`Piece ${p._id}: name="${p.piece.name}", hasComingUpTemplate=${hasComingUpTemplate}`)

			return hasComingUpTemplate || isComingUpName
		})

		context.logInfo(`onSetAsNext: Found ${comingUpPieces.length} Coming Up pieces`)
		if (comingUpPieces.length === 0) return

		// Fetch upcoming parts
		const upcomingParts = await context.getUpcomingParts(5)

		if (upcomingParts.length === 0) {
			context.logInfo('No upcoming parts found for Coming Up piece')
			return
		}

		// Build the data
		const partTitles = upcomingParts.map((part, index) => ({
			number: index + 1,
			title: part.title,
		}))

		// Update each Coming Up piece with the actual data
		for (const pieceInstance of comingUpPieces) {
			const piece = pieceInstance.piece
			const timelineObjs = piece.content.timelineObjects as any[]

			// Find and recreate the Coming Up timeline object with new data
			const newTimelineObjs = timelineObjs?.map((obj) => {
				if (obj.content?.name?.includes('coming-up')) {
					// Create a new timeline object with updated data
					return {
						...obj,
						content: {
							...obj.content,
							data: {
								...obj.content.data,
								parts: partTitles,
								count: partTitles.length,
							},
						},
					}
				}
				return obj
			})

			if (newTimelineObjs) {
				await context.updatePieceInstance(pieceInstance._id, {
					content: {
						timelineObjects: newTimelineObjs,
					},
				})
			}
		}

		context.logInfo(
			`Updated Coming Up piece with ${upcomingParts.length} parts: ${upcomingParts.map((p) => p.title).join(', ')}`
		)
	} catch (error) {
		context.logError(`Error in onSetAsNext: ${error}`)
	}
}
