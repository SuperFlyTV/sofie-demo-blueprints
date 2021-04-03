import { IShowStyleUserContext, TSR } from '@sofie-automation/blueprints-integration'
import { literal } from '../../common/util'
import { StudioConfig } from '../../studio0/helpers/config'
import { AtemLayers } from '../../studio0/layers'
import { DVEDesigns, DVELayouts } from '../helpers/dve'

export function getBaseline(context: IShowStyleUserContext): TSR.TSRTimelineObj[] {
	const config = context.getShowStyleConfig() as StudioConfig

	return [
		literal<TSR.TimelineObjAtemSsrcProps>({
			id: '',
			enable: { while: 1 },
			priority: 0,
			layer: AtemLayers.AtemSuperSourceProps,
			content: {
				deviceType: TSR.DeviceType.ATEM,
				type: TSR.TimelineContentTypeAtem.SSRCPROPS,
				ssrcProps: {
					artFillSource: 3010, // atem mediaplayer1
					artCutSource: 3011,
					artOption: 1,
					artPreMultiplied: true,
					borderEnabled: false,
				},
			},
		}),

		literal<TSR.TimelineObjAtemSsrc>({
			id: '',
			enable: { while: 1 },
			priority: 0,
			layer: AtemLayers.AtemSuperSourceBoxes,
			content: {
				deviceType: TSR.DeviceType.ATEM,
				type: TSR.TimelineContentTypeAtem.SSRC,

				ssrc: {
					boxes: [...DVEDesigns[DVELayouts.TwoBox]],
				},
			},
		}),

		...config.atemOutputs.map((output) =>
			literal<TSR.TimelineObjAtemAUX>({
				id: '',
				enable: { while: 1 },
				priority: 0,
				layer: `atem_aux_${output.output - 1}`,
				content: {
					deviceType: TSR.DeviceType.ATEM,
					type: TSR.TimelineContentTypeAtem.AUX,

					aux: {
						input: output.source,
					},
				},
			})
		),
	]
}
