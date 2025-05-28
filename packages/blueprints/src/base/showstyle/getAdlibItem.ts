import {
	IBlueprintActionManifest,
	IBlueprintAdLibPiece,
	IngestAdlib,
	IShowStyleUserContext,
} from '@sofie-automation/blueprints-integration'
// import { identifyMosItem } from '../common/mos-parsers/storyItems'
// import { getStoryItemsOptions, parseConfig } from './helpers/config'
// import { parseStoryItem } from './helpers/storyItems'
// import { createBtsItem } from './helpers/storyItems/bts'

export function getAdlibItem(
	_context: IShowStyleUserContext,
	_ingestItem: IngestAdlib
): IBlueprintAdLibPiece | IBlueprintActionManifest | null {
	return null
	// if (ingestItem.payloadType !== 'mos' && ingestItem.payloadType !== 'MOS') {
	// 	throw new Error(`Unsupported payloadType: "${ingestItem.payloadType}"`)
	// }

	// const config = parseConfig(context)
	// const mosItem = identifyMosItem(context, getStoryItemsOptions(config, null), {
	// 	Content: ingestItem.payload,
	// 	Type: '',
	// })
	// const parsedItem = mosItem ? parseStoryItem(context, config, mosItem) : undefined

	// if (parsedItem) {
	// 	const bts = createBtsItem(context, config, null, parsedItem, 0)
	// 	return bts ?? null
	// } else {
	// 	return null
	// }
}
