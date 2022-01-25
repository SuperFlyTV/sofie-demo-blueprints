import { TimelineObjectCoreExt, TSR } from '@sofie-automation/blueprints-integration'
import { assertUnreachable, literal } from '../../common/util'
import { TimelineBlueprintExt } from '../../studio0/customTypes'
import { StudioConfig, VisionMixerType } from '../../studio0/helpers/config'
import { AtemLayers, VMixLayers } from '../../studio0/layers'

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
			priority: 10,
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
		literal<TSR.TimelineObjAtemME & TimelineBlueprintExt>({
			id: '',
			enable: { start: start },
			layer: AtemLayers.AtemMePreview,
			priority: 10,
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
				},
			],
		}),
	]
}

export function createVMixTimelineObjects(
	input: number,
	start = 0,
	transitionDuration = 40,
	transitionProps?: TSR.VMixTransition
): TSR.TimelineObjVMixAny[] {
	return [
		literal<TimelineObjectCoreExt & TSR.TimelineObjVMixProgram>({
			id: '',
			enable: { start: start },
			layer: VMixLayers.VMixMeProgram,
			content: {
				deviceType: TSR.DeviceType.VMIX,
				type: TSR.TimelineContentTypeVMix.PROGRAM,

				input,
				transition: transitionProps,
			},
		}),

		// Add object for preview
		literal<TSR.TimelineObjVMixPreview & TimelineBlueprintExt>({
			id: '',
			enable: { start: start },
			layer: VMixLayers.VMixMePreview,
			content: {
				deviceType: TSR.DeviceType.VMIX,
				type: TSR.TimelineContentTypeVMix.PREVIEW,

				input: 0,
			},
			keyframes: [
				{
					id: '',
					enable: {
						start: transitionDuration + 40, // after the transition keyframe
					},
					content: {
						input,
					},
					preserveForLookahead: true,
				},
			],
		}),
	]
}

export function createVisionMixerObjects(
	config: StudioConfig,
	input: number,
	start = 0,
	transitionDuration = 40,
	transitionProps?: {
		atemTransitionProps?: Omit<TSR.TimelineObjAtemME['content']['me'], 'programInput' | 'previewInput'>
		vmixTransitionProps?: TSR.VMixTransition
	}
): (TSR.TimelineObjVMixAny | TSR.TimelineObjAtemAny)[] {
	if (config.visionMixerType === VisionMixerType.Atem) {
		return createAtemInputTimelineObjects(input, start, transitionDuration, transitionProps?.atemTransitionProps)
	} else if (config.visionMixerType === VisionMixerType.VMix) {
		return createVMixTimelineObjects(input, start, transitionDuration, transitionProps?.vmixTransitionProps)
	} else {
		assertUnreachable(config.visionMixerType)
		return []
	}
}
