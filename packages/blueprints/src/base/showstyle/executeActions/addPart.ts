import {
	BlueprintPlayoutPersistentStore,
	IActionExecutionContext,
	IBlueprintPart,
	IBlueprintPiece,
	PieceLifespan,
} from '@sofie-automation/blueprints-integration'
import { AudioSourceType, SourceType } from '../../studio/helpers/config.js'
import { getOutputLayerForSourceLayer, SourceLayer } from '../applyconfig/layers.js'
import { getAudioPrimaryObject } from '../helpers/audio.js'
import { parseConfig } from '../helpers/config.js'
import { getSourceInfoFromRaw } from '../helpers/sources.js'
import { createVisionMixerObjects } from '../helpers/visionMixer.js'

interface AddPartPersistentState {
	partCounter?: number
}

export async function executeAddPart(
	context: IActionExecutionContext,
	playoutPersistentState: BlueprintPlayoutPersistentStore<unknown>
): Promise<void> {
	const store = playoutPersistentState as BlueprintPlayoutPersistentStore<AddPartPersistentState>
	const count = (store.getKey('partCounter') ?? 0) + 1
	store.setKey('partCounter', count)

	const config = parseConfig(context).studio
	const sourceInfo = getSourceInfoFromRaw(config, { type: SourceType.Camera, id: 1 })

	if (!sourceInfo.input) {
		context.notifyUserWarning('Camera 1 is not configured')
		context.logWarning('Cannot queue adlib part: Camera 1 input is missing from studio config')
		return
	}

	const externalId = `adlib-part-${count}`
	const title = `Adlib Part ${count}`

	const part: IBlueprintPart = {
		externalId,
		title,
	}

	const cameraPiece: IBlueprintPiece = {
		enable: {
			start: 0,
		},
		externalId,
		name: `Cam ${sourceInfo.id}`,
		lifespan: PieceLifespan.WithinPart,
		sourceLayerId: SourceLayer.Camera,
		outputLayerId: getOutputLayerForSourceLayer(SourceLayer.Camera),
		content: {
			timelineObjects: [
				...createVisionMixerObjects(config, sourceInfo.input),
				getAudioPrimaryObject(config, [{ type: AudioSourceType.Host, index: 0 }]),
			],
		},
	}

	await context.queuePart(part, [cameraPiece])
}
