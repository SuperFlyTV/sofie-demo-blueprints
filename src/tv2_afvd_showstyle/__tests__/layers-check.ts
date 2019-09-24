import * as _ from 'underscore'

import { DeviceType, TSRTimelineObjBase } from 'timeline-state-resolver-types'
import {
	BlueprintMappings,
	IBlueprintPieceGeneric,
	ShowStyleContext,
	TimelineObjectCoreExt
} from 'tv-automation-sofie-blueprints-integration'

import { SourceLayer } from '../../tv2_afvd_studio/layers'
import mappingsDefaults, { getHyperdeckMappings } from '../../tv2_afvd_studio/migrations/mappings-defaults'
import { BlueprintConfig, parseConfig } from '../helpers/config'
import OutputlayerDefaults from '../migrations/outputlayer-defaults'

function getMappingsForSources(config: BlueprintConfig): BlueprintMappings {
	if (!config) {
		// No config defined, so skip
		return {}
	}

	const res: BlueprintMappings = {}

	return res
}

export function checkAllLayers(
	context: ShowStyleContext,
	pieces: IBlueprintPieceGeneric[],
	otherObjs?: TSRTimelineObjBase[]
) {
	const missingSourceLayers: string[] = []
	const missingOutputLayers: string[] = []
	const missingLayers: Array<string | number> = []
	const wrongDeviceLayers: Array<string | number> = []

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

	for (const sli of pieces) {
		if (allSourceLayers.indexOf(sli.sourceLayerId) === -1) {
			missingSourceLayers.push(sli.sourceLayerId)
		}
		if (allOutputLayers.indexOf(sli.outputLayerId) === -1) {
			missingOutputLayers.push(sli.outputLayerId)
		}

		if (sli.content && sli.content.timelineObjects) {
			for (const obj of sli.content.timelineObjects as TimelineObjectCoreExt[]) {
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
