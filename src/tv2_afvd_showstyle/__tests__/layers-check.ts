import * as _ from 'underscore'

import {
	IBlueprintPieceGeneric,
	TimelineObjectCoreExt,
	ShowStyleContext,
	BlueprintMappings
} from 'tv-automation-sofie-blueprints-integration'
import { DeviceType, TSRTimelineObjBase } from 'timeline-state-resolver-types'

import { SourceLayer } from '../../types/layers'
import OutputlayerDefaults from '../migrations/outputlayer-defaults'
import { parseConfig, BlueprintConfig } from '../helpers/config'
import mappingsDefaults, { getHyperdeckMappings } from '../migrations/mappings-defaults'

function getMappingsForSources (config: BlueprintConfig): BlueprintMappings {
	if (!config) {
		// No config defined, so skip
		return {}
	}

	let res: BlueprintMappings = {}

	return res
}

export function checkAllLayers (context: ShowStyleContext, pieces: IBlueprintPieceGeneric[], otherObjs?: TSRTimelineObjBase[]) {
	const missingSourceLayers: string[] = []
	const missingOutputLayers: string[] = []
	const missingLayers: (string | number)[] = []
	const wrongDeviceLayers: (string | number)[] = []

	const config = parseConfig(context)

	const allSourceLayers = _.values(SourceLayer)
	const allOutputLayers = _.map(OutputlayerDefaults, m => m._id)

	const allMappings = {
		...mappingsDefaults,
		...getMappingsForSources(config),
		...getHyperdeckMappings(config.studio.HyperdeckCount)
	}

	const validateObject = (obj: TimelineObjectCoreExt) => {
		const isAbstract = obj.content.deviceType === DeviceType.ABSTRACT
		const mapping = allMappings[obj.layer]

		if (mapping && mapping.device !== obj.content.deviceType) {
			wrongDeviceLayers.push(obj.layer)
		} else if (!isAbstract && !mapping) {
			missingLayers.push(obj.layer)
		}
	}

	for (let sli of pieces) {
		if (allSourceLayers.indexOf(sli.sourceLayerId) === -1) {
			missingSourceLayers.push(sli.sourceLayerId)
		}
		if (allOutputLayers.indexOf(sli.outputLayerId) === -1) {
			missingOutputLayers.push(sli.outputLayerId)
		}

		if (sli.content && sli.content.timelineObjects) {
			for (let obj of sli.content.timelineObjects as TimelineObjectCoreExt[]) {
				validateObject(obj)
			}
		}
	}

	if (otherObjs) {
		_.each(otherObjs, validateObject)
	}

	expect(_.unique(missingOutputLayers)).toHaveLength(0)
	expect(_.unique(missingSourceLayers)).toHaveLength(0)
	expect(_.unique(missingLayers)).toHaveLength(0)
	expect(_.unique(wrongDeviceLayers)).toHaveLength(0)
}
