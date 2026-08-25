import { IActionExecutionContext } from '@sofie-automation/blueprints-integration'
import { SourceLayer } from '../applyconfig/layers.js'

export async function executeOGrafClear(context: IActionExecutionContext): Promise<void> {
	await context.stopPiecesOnLayers([SourceLayer.OGrafOverlay1, SourceLayer.OGrafOverlay2, SourceLayer.OGrafOverlay3])
}
export async function executeOGrafClearStudio(context: IActionExecutionContext): Promise<void> {
	await context.stopPiecesOnLayers([SourceLayer.OGrafStudio1, SourceLayer.OGrafStudio2, SourceLayer.OGrafStudio3])
}
