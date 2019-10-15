import {
	DeviceType,
	TimelineContentTypeSisyfos,
	TimelineObjSisyfosMessage,
	TSRTimelineObj
} from 'timeline-state-resolver-types'
import { literal } from '../../../common/util'
import { SisyfosSourceCamera, SisyfosSourceRemote } from '../../../tv2_afvd_studio/layers'

export function GetSisyfosTimelineObjForCamera(sourceType: string): TSRTimelineObj[] {
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
					isPgm: 1
				}
			})
		)
	}
	return audioTimeline
}
export function GetSisyfosTimelineObjForEkstern(sourceType: string): TSRTimelineObj[] {
	let audioTimeline: TSRTimelineObj[] = []

	const eksternProps = sourceType.match(/^LIVE ([^\s]+)(?: (.+))?$/i)
	if (eksternProps) {
		const source = eksternProps[1]
		const variant = eksternProps[2]

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
									layer: SisyfosSourceRemote(source, 'stereo_1'),
									content: {
										deviceType: DeviceType.SISYFOS,
										type: TimelineContentTypeSisyfos.SISYFOS,
										isPgm: 1,
										faderLevel: 0.75
									}
								}),
								literal<TimelineObjSisyfosMessage>({
									id: '',
									enable: {
										start: 0
									},
									priority: 1,
									layer: SisyfosSourceRemote(source, 'stereo_2'),
									content: {
										deviceType: DeviceType.SISYFOS,
										type: TimelineContentTypeSisyfos.SISYFOS,
										isPgm: 1,
										faderLevel: 0.75
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
									layer: SisyfosSourceRemote(source, variant),
									content: {
										deviceType: DeviceType.SISYFOS,
										type: TimelineContentTypeSisyfos.SISYFOS,
										isPgm: 1,
										faderLevel: 0.75
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
									isPgm: 1,
									faderLevel: 0.75
								}
							})
					  ])
			]
		}
	}

	return audioTimeline
}
