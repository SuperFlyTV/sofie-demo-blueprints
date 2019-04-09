import * as _ from 'underscore'

import {
	IBlueprintSegmentLineItem,
	IBlueprintSegmentLineAdLibItem,
	Timeline,
	TimelineObjectCoreExt,
	ShowStyleContext
} from 'tv-automation-sofie-blueprints-integration'

import {
	SourceLayer,
	RealLLayers,
	VirtualLLayers
} from '../../types/layers'
import OutputlayerDefaults from '../migrations/outputlayer-defaults'
import { parseConfig, BlueprintConfig } from '../helpers/config'
import { getHyperdeckMappings } from '../migrations/mappings-defaults'

function getMappingsForSources (config: BlueprintConfig): string[] {
	if (!config) {
		// No config defined, so skip
		return []
	}

	// const sources = parseSources(undefined, config)

	let res: string[] = []

	// _.each(sources, v => {
	// 	if (v.type === SourceLayerType.CAMERA && v.ptzDevice) {
	// 		res = res.concat(_.keys(getPtzMappings(v.ptzDevice)))
	// 	}
	// })

	return res
}

export function checkAllLayers (context: ShowStyleContext, segmentLineItems: (IBlueprintSegmentLineItem | IBlueprintSegmentLineAdLibItem)[], otherObjs?: Timeline.TimelineObject[]) {
	const missingSourceLayers: string[] = []
	const missingOutputLayers: string[] = []
	const missingLLayers: (string | number)[] = []

	const config = parseConfig(context)

	const allSourceLayers = _.values(SourceLayer)
	const allOutputLayers = _.map(OutputlayerDefaults, m => m._id)
	const allLLayers = RealLLayers().concat(getMappingsForSources(config))
						.concat(_.keys(getHyperdeckMappings(config.studio.HyperdeckCount)))

	const virtualLLayers = VirtualLLayers()

	for (let sli of segmentLineItems) {
		if (allSourceLayers.indexOf(sli.sourceLayerId) === -1) {
			missingSourceLayers.push(sli.sourceLayerId)
		}
		if (allOutputLayers.indexOf(sli.outputLayerId) === -1) {
			missingOutputLayers.push(sli.outputLayerId)
		}

		if (sli.content && sli.content.timelineObjects) {
			for (let obj of sli.content.timelineObjects as TimelineObjectCoreExt[]) {
				if (!obj.isAbstract && allLLayers.indexOf(obj.LLayer) === -1) {
					missingLLayers.push(obj.LLayer)
				} else if (obj.isAbstract && virtualLLayers.indexOf(obj.LLayer) === -1) {
					// isAbstract means the layer shouldnt exist, or routing will get confused
					missingLLayers.push(obj.LLayer)
				}
			}
		}
	}

	if (otherObjs) {
		for (let obj of otherObjs) {
			if (allLLayers.indexOf(obj.LLayer) === -1) {
				missingLLayers.push(obj.LLayer)
			}
		}
	}

	expect(_.unique(missingOutputLayers)).toHaveLength(0)
	expect(_.unique(missingSourceLayers)).toHaveLength(0)
	expect(_.unique(missingLLayers)).toHaveLength(0)
}
