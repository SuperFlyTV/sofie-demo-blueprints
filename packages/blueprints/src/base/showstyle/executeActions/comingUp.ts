import {
	IActionExecutionContext,
	IBlueprintActionManifest,
	ExtendedIngestRundown,
	TSR,
	PieceLifespan,
} from '@sofie-automation/blueprints-integration'
import { literal, t } from '../../../common/util.js'
import { SourceLayer, getOutputLayerForSourceLayer } from '../applyconfig/layers.js'
import { ActionId } from './actionDefinitions.js'
import { CasparCGLayers } from '../../studio/layers.js'
import { TimelineBlueprintExt } from '../../studio/customTypes.js'

/**
 * Defines an AdLib Action that creates a "Coming Up" graphic showing the next 5 parts.
 * Demonstrates the getUpcomingParts() method from the blueprint API.
 *
 * @param ingestRundown - {ExtendedIngestRundown}
 * @returns IBlueprintActionManifest
 */
export const comingUpAdlibAction = (ingestRundown: ExtendedIngestRundown): IBlueprintActionManifest =>
	literal<IBlueprintActionManifest>({
		actionId: ActionId.ComingUp,
		userData: {},
		userDataManifest: {},
		display: {
			label: t('Coming Up'),
			sourceLayerId: SourceLayer.GFX,
			outputLayerId: getOutputLayerForSourceLayer(SourceLayer.GFX),
			tags: ['coming-up'],
		},
		externalId: ingestRundown.externalId,
	})

/**
 * Executes the "Coming Up" action by fetching the upcoming parts and creating a graphic
 * piece with their titles.
 *
 * This demonstrates the getUpcomingParts() method which is available in action contexts,
 * onTake, and onSetAsNext contexts.
 *
 * @param context - {IActionExecutionContext}
 */
export async function executeComingUp(context: IActionExecutionContext): Promise<void> {
	try {
		// Fetch the next 5 parts using the new getUpcomingParts method
		const upcomingParts = await context.getUpcomingParts(5)

		if (upcomingParts.length === 0) {
			context.notifyUserWarning('No upcoming parts found')
			return
		}

		// Build the data for the graphic template
		const partTitles = upcomingParts.map((part, index) => ({
			number: index + 1,
			title: part.title,
		}))

		// Create a graphic piece showing the upcoming parts
		await context.insertPiece('current', {
			externalId: `coming-up-${Date.now()}`,
			name: `Coming Up: ${partTitles[0]?.title || 'Next Parts'}`,
			sourceLayerId: SourceLayer.GFX,
			outputLayerId: getOutputLayerForSourceLayer(SourceLayer.GFX),
			lifespan: PieceLifespan.WithinPart,
			content: {
				timelineObjects: [
					literal<TimelineBlueprintExt<TSR.TimelineContentCCGTemplate>>({
						id: '',
						enable: {
							start: 0,
							duration: 10000, // Show for 10 seconds by default
						},
						layer: CasparCGLayers.CasparCGClipPlayer1,
						priority: 10, // Higher priority for adlib
						content: {
							deviceType: TSR.DeviceType.CASPARCG,
							type: TSR.TimelineContentTypeCasparCg.TEMPLATE,
							templateType: 'html',
							name: 'gfx/coming-up', // This would be your actual template name
							data: {
								// Pass the upcoming parts data to the template
								parts: partTitles,
								count: partTitles.length,
							},
							useStopCommand: true,
						},
					}),
				],
				// Store the data in a way that can be previewed
				templateData: {
					parts: partTitles,
					count: partTitles.length,
				},
			},
			enable: {
				start: 'now' as const,
			},
		})

		context.logInfo(
			`Coming Up graphic created with ${upcomingParts.length} parts: ${upcomingParts.map((p) => p.title).join(', ')}`
		)
	} catch (error) {
		context.notifyUserError('Failed to create Coming Up graphic')
		context.logError(`Error in executeComingUp: ${error}`)
	}
}
