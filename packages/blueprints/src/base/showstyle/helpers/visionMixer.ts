import { TSR } from '@sofie-automation/blueprints-integration'
import { assertUnreachable, literal } from '../../../common/util.js'
import { TimelineBlueprintExt } from '../../studio/customTypes.js'
import { StudioConfig, VisionMixerDevice } from '../../studio/helpers/config.js'
import { VmixInputReference } from '../../studio/helpers/vmixInputs.js'
import { AtemLayers, VMixLayers } from '../../studio/layers.js'

export function createAtemInputTimelineObjects(
	input: number,
	start = 0,
	transitionDuration = 40,
	transitionProps?: Omit<TSR.TimelineContentAtemME['me'], 'programInput' | 'previewInput'>
): TimelineBlueprintExt<TSR.TimelineContentAtemME>[] {
	return [
		literal<TimelineBlueprintExt<TSR.TimelineContentAtemME>>({
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
						me: {
							input: input,
							transition: TSR.AtemTransitionStyle.CUT,
							...(transitionProps || {}),
						},
					},
				},
			],
			priority: 1,
		}),
		// Add object for preview
		literal<TimelineBlueprintExt<TSR.TimelineContentAtemME>>({
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
				},
			],
			priority: 1,
		}),
	]
}

export function createVMixTimelineObjects(
	input: VmixInputReference,
	start = 0,
	transitionDuration = 40,
	transitionProps?: TSR.VMixTransition,
	mix?: number
): TimelineBlueprintExt<TSR.TimelineContentVMixAny>[] {
	const programLayer = mix && mix > 1 ? `vmix_mix${mix}_program` : VMixLayers.VMixMeProgram
	const previewLayer = mix && mix > 1 ? `vmix_mix${mix}_preview` : VMixLayers.VMixMePreview

	return [
		literal<TimelineBlueprintExt<TSR.TimelineContentVMixProgram>>({
			id: '',
			enable: { start: start },
			layer: programLayer,
			content: {
				deviceType: TSR.DeviceType.VMIX,
				type: TSR.TimelineContentTypeVMix.PROGRAM,

				input,
				transition: transitionProps,
			},
			priority: 1,
		}),

		// Add object for preview — explicit timeline object drives lookahead; mapping disableDefaults prevents baseline spam
		literal<TimelineBlueprintExt<TSR.TimelineContentVMixPreview>>({
			id: '',
			enable: { start: start },
			layer: previewLayer,
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
			priority: 1,
		}),
	]
}

export function createVisionMixerObjects(
	config: StudioConfig,
	input: VmixInputReference,
	start = 0,
	transitionDuration = 40,
	transitionProps?: {
		atemTransitionProps?: Omit<TSR.TimelineContentAtemME['me'], 'programInput' | 'previewInput'>
		vmixTransitionProps?: TSR.VMixTransition
	}
): TimelineBlueprintExt<TSR.TimelineContentVMixAny | TSR.TimelineContentAtemAny>[] {
	if (config.visionMixer.type === VisionMixerDevice.Atem) {
		return createAtemInputTimelineObjects(
			typeof input === 'number' ? input : Number(input) || 0,
			start,
			transitionDuration,
			transitionProps?.atemTransitionProps
		)
	} else if (config.visionMixer.type === VisionMixerDevice.VMix) {
		return createVMixTimelineObjects(input, start, transitionDuration, transitionProps?.vmixTransitionProps)
	} else {
		assertUnreachable(config.visionMixer.type)
		return []
	}
}
