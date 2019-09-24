import {
	AtemTransitionStyle,
	DeviceType,
	MappingAtemType,
	TimelineContentTypeAtem,
	TimelineObjAtemME,
	TSRTimelineObjBase
} from 'timeline-state-resolver-types'
import { BlueprintMapping, BlueprintMappings, IStudioContext } from 'tv-automation-sofie-blueprints-integration'
import * as _ from 'underscore'
import { literal } from '../common/util'
import { AtemSourceIndex } from '../types/atem'

function filterMappings(
	input: BlueprintMappings,
	filter: (k: string, v: BlueprintMapping) => boolean
): BlueprintMappings {
	const result: BlueprintMappings = {}

	_.each(_.keys(input), k => {
		const v = input[k]
		if (filter(k, v)) {
			result[k] = v
		}
	})

	return result
}
function convertMappings<T>(input: BlueprintMappings, func: (k: string, v: BlueprintMapping) => T): T[] {
	return _.map(_.keys(input), k => func(k, input[k]))
}

export function getBaseline(context: IStudioContext): TSRTimelineObjBase[] {
	const mappings = context.getStudioMappings()

	const atemMeMappings = filterMappings(
		mappings,
		(_id, v) => v.device === DeviceType.ATEM && (v as any).mappingType === MappingAtemType.MixEffect
	)

	return [
		...convertMappings(atemMeMappings, id =>
			literal<TimelineObjAtemME>({
				id: '',
				enable: { while: '1', duration: 0 },
				priority: 0,
				layer: id,
				content: {
					deviceType: DeviceType.ATEM,
					type: TimelineContentTypeAtem.ME,
					me: {
						input: AtemSourceIndex.Bars,
						transition: AtemTransitionStyle.CUT
					}
				}
			})
		)
	]
}
