import { TimelineObjectCoreExt, TSR } from '@sofie-automation/blueprints-integration'
import { literal } from '../../common/util'
import { AtemLayers } from '../../studio0/layers'

export function createAtemInputTimelineObjects(
	input: number,
	start = 0,
	transitionDuration = 40,
	transitionProps?: Omit<TSR.TimelineObjAtemME['content']['me'], 'programInput' | 'previewInput'>
): TSR.TimelineObjAtemME[] {
	return [
		literal<TimelineObjectCoreExt & TSR.TimelineObjAtemME>({
			id: '',
			enable: { start: start },
			layer: AtemLayers.AtemMeProgram,
			content: {
				deviceType: TSR.DeviceType.ATEM,
				type: TSR.TimelineContentTypeAtem.ME,

				me: {
					programInput: input,
				},
			},
			keyframes: [
				{
					id: '',
					enable: {
						start: 0,
						duration: transitionDuration, // only used to do the transition
					},
					content: {
						me: literal<TSR.TimelineObjAtemME['content']['me']>({
							input: input,
							transition: TSR.AtemTransitionStyle.CUT,
							...(transitionProps || {}),
						}),
					},
				},
			],
		}),
		// Add object for preview
		literal<TSR.TimelineObjAtemME>({
			id: '',
			enable: { start: start },
			layer: AtemLayers.AtemMePreview,
			content: {
				deviceType: TSR.DeviceType.ATEM,
				type: TSR.TimelineContentTypeAtem.ME,

				me: {
					previewInput: 0,
				},
			},
			keyframes: [
				{
					id: '',
					enable: {
						start: transitionDuration + 40, // after the transition keyframe
					},
					content: {
						me: {
							previewInput: input,
						},
					},
					preserveForLookahead: true,
				} as any, // todo
			],
		}),
	]
}
