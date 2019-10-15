import * as _ from 'underscore'

import { DeviceType, TSRTimelineObjBase } from 'timeline-state-resolver-types'
import {
	BlueprintMappings,
	IBlueprintPieceGeneric,
	ShowStyleContext,
	TimelineObjectCoreExt
} from 'tv-automation-sofie-blueprints-integration'

import { literal } from '../../common/util'
import mappingsDefaults, {
	getCameraSisyfosMappings,
	getHyperdeckMappings,
	getMediaPlayerMappings,
	getRemoteSisyfosMappings,
	getSkypeSisyfosMappings
} from '../../tv2_afvd_studio/migrations/mappings-defaults'
import { parseConfig } from '../helpers/config'
import { SourceLayer } from '../layers'
import OutputlayerDefaults from '../migrations/outputlayer-defaults'

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

	const allSourceLayers: string[] = _.values(SourceLayer)
	const allOutputLayers = _.map(OutputlayerDefaults, m => m._id)

	const allMappings = literal<BlueprintMappings>({
		...mappingsDefaults,
		...getHyperdeckMappings(config.studio.HyperdeckCount),
		...getMediaPlayerMappings(config.studio.MediaPlayerType, config.mediaPlayers),
		...getCameraSisyfosMappings(
			'1:1,2:2,3:3,4:4,5:5,CS 3:6,AR:7,HVID:8,1S:1,3S:3,X8:8,11:11,12:12,13:13,14:14,15:15,SORT:1,CS1:1,CS2:2'
		),
		...getRemoteSisyfosMappings('1:1'),
		...getSkypeSisyfosMappings('1:1')
	})

	const validateObject = (obj: TimelineObjectCoreExt) => {
		const isAbstract = obj.content.deviceType === DeviceType.ABSTRACT
		const mapping = allMappings[obj.layer]

		const isMediaPlayerPending =
			(obj.layer + '').endsWith('_pending') && mapping && mapping.device === DeviceType.ABSTRACT
		if (mapping && mapping.device !== obj.content.deviceType && !isMediaPlayerPending) {
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
