import { IStudioContext, Timeline, BlueprintMappings, BlueprintMapping } from 'tv-automation-sofie-blueprints-integration'
import * as _ from 'underscore'
import { DeviceType, MappingAtemType, TimelineObjAtemME, TimelineContentTypeAtem, AtemTransitionStyle } from 'timeline-state-resolver-types'
import { literal } from '../common/util'
import { AtemSourceIndex } from '../types/atem'

function filterMappings (input: BlueprintMappings, filter: (k: string, v: BlueprintMapping) => boolean): BlueprintMappings {
	const result: BlueprintMappings = {}

	_.each(_.keys(input), k => {
		const v = input[k]
		if (filter(k, v)) {
			result[k] = v
		}
	})

	return result
}
function convertMappings<T> (input: BlueprintMappings, func: (k: string, v: BlueprintMapping) => T): T[] {
	return _.map(_.keys(input), k => func(k, input[k]))
}

export function getBaseline (context: IStudioContext): Timeline.TimelineObject[] {
	const mappings = context.getStudioMappings()

	const atemMeMappings = filterMappings(mappings, (_, v) => v.device === DeviceType.ATEM && (v as any).mappingType === MappingAtemType.MixEffect)

	return [
		...convertMappings(atemMeMappings, id => literal<TimelineObjAtemME>({
			id: '',
			trigger: { type: Timeline.TriggerType.LOGICAL, value: '1' },
			priority: 0,
			duration: 0,
			LLayer: id,
			content: {
				type: TimelineContentTypeAtem.ME,
				attributes: {
					previewInput: AtemSourceIndex.Bars,
					transition: AtemTransitionStyle.CUT
				}
			}
		}))
	]
}
