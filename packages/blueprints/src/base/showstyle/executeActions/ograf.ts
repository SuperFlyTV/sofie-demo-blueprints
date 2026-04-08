import { IActionExecutionContext } from '@sofie-automation/blueprints-integration'
import { SourceLayer } from '../applyconfig/layers.js'

export async function executeOGrafClear(context: IActionExecutionContext): Promise<void> {
	await context.stopPiecesOnLayers([SourceLayer.OGrafOverlay1, SourceLayer.OGrafOverlay2, SourceLayer.OGrafOverlay3])
}
