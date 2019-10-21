import {
	DeviceType,
	TimelineContentTypeSisyfos,
	TimelineObjSisyfosMessage,
	TSRTimelineObj
} from 'timeline-state-resolver-types'
import { literal } from '../../../common/util'
import { SisyfosSourceCamera, SisyfosSourceRemote } from '../../../tv2_afvd_studio/layers'

export function GetSisyfosTimelineObjForCamera(sourceType: string, voiceOverLevel: boolean): TSRTimelineObj[] {
	const audioTimeline: TSRTimelineObj[] = []
	const useMic = !sourceType.match(/^(?:KAM|CAM)(?:ERA)? (.+) minus mic(.*)$/i)
	const camName = sourceType.match(/^(?:KAM|CAM)(?:ERA)? (.+)$/i)
	if (useMic && camName) {
		audioTimeline.push(
			literal<TimelineObjSisyfosMessage>({
				id: '',
				enable: {
					start: 0
				},
				priority: 1,
				layer: SisyfosSourceCamera(camName[1]),
				content: {
					deviceType: DeviceType.SISYFOS,
					type: TimelineContentTypeSisyfos.SISYFOS,
					isPgm: voiceOverLevel ? 2 : 1,
					fadeToBlack: false
				}
			})
		)
	}
	return audioTimeline
}
export function GetSisyfosTimelineObjForEkstern(sourceType: string, voiceOverLevel: boolean): TSRTimelineObj[] {
	let audioTimeline: TSRTimelineObj[] = []

	const eksternProps = sourceType.match(/^(?:LIVE|SKYPE) ([^\s]+)(?: (.+))?$/i)
	if (eksternProps) {
		const source = eksternProps[1]
		const variant = eksternProps[2]
		const isSkype = !!sourceType.match(/^SKYPE/)

		if (source) {
			audioTimeline = [
				...(variant
					? variant.match(/stereo/gi)
						? [
								literal<TimelineObjSisyfosMessage>({
									id: '',
									enable: {
										start: 0
									},
									priority: 1,
									layer: isSkype
										? SisyfosSourceRemote(`skype_${source}`, 'stereo')
										: SisyfosSourceRemote(source, 'stereo'),
									content: {
										deviceType: DeviceType.SISYFOS,
										type: TimelineContentTypeSisyfos.SISYFOS,
										isPgm: voiceOverLevel ? 2 : 1,
										fadeToBlack: false
									}
								})
						  ]
						: [
								literal<TimelineObjSisyfosMessage>({
									id: '',
									enable: {
										start: 0
									},
									priority: 1,
									layer: isSkype
										? SisyfosSourceRemote(`skype_${source}`, variant)
										: SisyfosSourceRemote(source, variant),
									content: {
										deviceType: DeviceType.SISYFOS,
										type: TimelineContentTypeSisyfos.SISYFOS,
										isPgm: voiceOverLevel ? 2 : 1,
										fadeToBlack: false
									}
								})
						  ]
					: [
							literal<TimelineObjSisyfosMessage>({
								id: '',
								enable: {
									start: 0
								},
								priority: 1,
								layer: SisyfosSourceRemote(source),
								content: {
									deviceType: DeviceType.SISYFOS,
									type: TimelineContentTypeSisyfos.SISYFOS,
									isPgm: voiceOverLevel ? 2 : 1,
									fadeToBlack: false
								}
							})
					  ])
			]
		}
	}
	return audioTimeline
}

export function GetSisyfosTimelineObjFadeToBlack(): TSRTimelineObj[] {
	const audioTimeline: TSRTimelineObj[] = [
		literal<TimelineObjSisyfosMessage>({
			id: '',
			enable: {
				start: 0
			},
			priority: 1,
			// TODO: Add to correct layer, an overall for all channels
			layer: '',
			content: {
				deviceType: DeviceType.SISYFOS,
				type: TimelineContentTypeSisyfos.SISYFOS,
				fadeToBlack: true
			}
		})
	]
	return audioTimeline
}
