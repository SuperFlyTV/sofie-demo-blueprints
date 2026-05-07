import { TSR } from '@sofie-automation/blueprints-integration'
import { assertUnreachable, literal } from '../../../common/util.js'
import { ObsSourceConfig } from '../../../$schemas/generated/main-studio-config.js'
import { TimelineBlueprintExt } from '../../studio/customTypes.js'
import { SourceType, StudioConfig, VisionMixerDevice } from '../../studio/helpers/config.js'
import { getOBSClipMediaPlayerSourceIds } from '../../studio/helpers/obsSources.js'
import { AtemLayers, OBSLayers, VMixLayers } from '../../studio/layers.js'

interface ABSessionLabel {
	poolName: string
	sessionName: string
}

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
	input: number,
	start = 0,
	transitionDuration = 40,
	transitionProps?: TSR.VMixTransition
): TimelineBlueprintExt<TSR.TimelineContentVMixAny>[] {
	return [
		literal<TimelineBlueprintExt<TSR.TimelineContentVMixProgram>>({
			id: '',
			enable: { start: start },
			layer: VMixLayers.VMixMeProgram,
			content: {
				deviceType: TSR.DeviceType.VMIX,
				type: TSR.TimelineContentTypeVMix.PROGRAM,

				input,
				transition: transitionProps,
			},
			priority: 1,
		}),

		// Add object for preview
		literal<TimelineBlueprintExt<TSR.TimelineContentVMixPreview>>({
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
			priority: 1,
		}),
	]
}

export function createVisionMixerObjects(
	config: StudioConfig,
	input: number | string,
	start = 0,
	transitionDuration = 40,
	transitionProps?: {
		atemTransitionProps?: Omit<TSR.TimelineContentAtemME['me'], 'programInput' | 'previewInput'>
		vmixTransitionProps?: TSR.VMixTransition
	},
	abSession?: ABSessionLabel
): TimelineBlueprintExt<TSR.TimelineContentVMixAny | TSR.TimelineContentAtemAny | TSR.TimelineContentOBSAny>[] {
	if (config.visionMixer.type === VisionMixerDevice.Atem) {
		return createAtemInputTimelineObjects(
			Number(input),
			start,
			transitionDuration,
			transitionProps?.atemTransitionProps
		)
	} else if (config.visionMixer.type === VisionMixerDevice.VMix) {
		return createVMixTimelineObjects(Number(input), start, transitionDuration, transitionProps?.vmixTransitionProps)
	} else if (config.visionMixer.type === VisionMixerDevice.OBS) {
		const clipMediaPlayerSourceIds = getOBSClipMediaPlayerSourceIds(config)
		const obsMediaPlayerSceneKeyframes = abSession
			? Object.entries<ObsSourceConfig>(config.obsSources)
					.filter(
						([sourceId, source]) =>
							source.type === SourceType.MediaPlayer &&
							!!source.sceneName &&
							clipMediaPlayerSourceIds.includes(sourceId)
					)
					.map(([sourceId, source]) => ({
						id: '',
						enable: { while: 1 },
						disabled: true,
						content: {
							sceneName: source.sceneName,
						},
						abSession: {
							poolName: abSession.poolName,
							playerId: sourceId,
						},
						preserveForLookahead: true,
					}))
			: undefined

		return [
			literal<TimelineBlueprintExt<TSR.TimelineContentOBSCurrentScene>>({
				id: '',
				enable: { start },
				layer: OBSLayers.OBSCurrentScene,
				content: {
					deviceType: TSR.DeviceType.OBS,
					type: TSR.TimelineContentTypeOBS.CURRENT_SCENE,
					sceneName: `${input || ''}`,
				},
				keyframes: obsMediaPlayerSceneKeyframes as any,
				priority: 1,
				...(abSession ? { abSessions: [abSession] } : {}),
			}),
		]
	} else {
		assertUnreachable(config.visionMixer.type)
		return []
	}
}
