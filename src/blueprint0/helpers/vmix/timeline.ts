import { literal } from '../../../common/util'
import { TimelineEnable } from 'timeline-state-resolver-types/dist/superfly-timeline'
import { VMixLLayer } from '../../../types/layers'
import { TimelineObjVMixPlayClip, DeviceType, TimelineContentTypeVMix, VMixTransition, TimelineObjVMixClipToProgram, TimelineObjVMixSetOutput, TimelineObjVMixStartExternal, TimelineObjVMixOverlayInputByNameIn, TimelineObjVMixInput } from 'timeline-state-resolver-types'

export function CreatePlayClipTimelineObject (enable: TimelineEnable, layer: VMixLLayer, file: string, mediaDirectory: string): TimelineObjVMixPlayClip {
	return literal<TimelineObjVMixPlayClip>({
		id: '',
		enable: enable,
		priority: 1,
		layer: layer,
		content: {
			deviceType: DeviceType.VMIX,
			type: TimelineContentTypeVMix.PLAY_CLIP,
			mediaDirectory: mediaDirectory,
			clipName: file
		}
	})
}

export function CreateSwitchToClipTimelineObject (enable: TimelineEnable, layer: VMixLLayer, file: string, transition?: VMixTransition) {
	return literal<TimelineObjVMixClipToProgram>({
		id: '',
		enable: enable,
		priority: 1,
		layer: layer,
		content: {
			deviceType: DeviceType.VMIX,
			type: TimelineContentTypeVMix.CLIP_TO_PROGRAM,
			clipName: file,
			transition: transition
		}
	})
}

export function CreateSwitchToInputTimelineObject (enable: TimelineEnable, layer: VMixLLayer, input: string, transition?: VMixTransition) {
	return literal<TimelineObjVMixInput>({
		id: '',
		enable: enable,
		priority: 1,
		layer: layer,
		content: {
			deviceType: DeviceType.VMIX,
			type: TimelineContentTypeVMix.INPUT,
			input: input,
			transition: transition
		}
	})
}

export function CreatePlaceOnScreenTimelineObject (enable: TimelineEnable, layer: VMixLLayer, file: string) {
	return literal<TimelineObjVMixSetOutput>({
		id: '',
		enable: enable,
		priority: 1,
		layer: layer,
		content: {
			deviceType: DeviceType.VMIX,
			type: TimelineContentTypeVMix.SET_OUTPUT,
			name: 'External2',
			output: file
		}
	})
}

export function CreateStartExternalTimelineObject (enable: TimelineEnable, layer: VMixLLayer) {
	return literal<TimelineObjVMixStartExternal>({
		id: '',
		enable: enable,
		priority: 1,
		layer: layer,
		content: {
			deviceType: DeviceType.VMIX,
			type: TimelineContentTypeVMix.START_EXTERNAL
		}
	})
}

export function CreateOverlayTimelineObject (enable: TimelineEnable, layer: VMixLLayer, file: string, mediaDirectory: string) {
	return literal<TimelineObjVMixOverlayInputByNameIn>({
		id: 'overlayIn1',
		enable: enable,
		priority: 1,
		layer: layer,
		content: {
			deviceType: DeviceType.VMIX,
			type: TimelineContentTypeVMix.OVERLAY_INPUT_BY_NAME_IN,
			inputName: file,
			mediaDirectory: mediaDirectory,
			overlay: 4
		}
	})
}
