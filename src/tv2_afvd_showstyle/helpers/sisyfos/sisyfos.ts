import {
	DeviceType,
	TimelineContentTypeSisyfos,
	TimelineObjSisyfosMessage,
	TSRTimelineObj
} from 'timeline-state-resolver-types'
import { literal } from '../../../common/util'
import { SisyfosLLAyer } from '../../../tv2_afvd_studio/layers'

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
				layer: SisyfosLLAyer.SisyfosSourceVært_1_ST_A,
				content: {
					deviceType: DeviceType.SISYFOS,
					type: TimelineContentTypeSisyfos.SISYFOS,
					isPgm: voiceOverLevel ? 2 : 1
				}
			}),
			literal<TimelineObjSisyfosMessage>({
				id: '',
				enable: {
					start: 0
				},
				priority: 1,
				layer: SisyfosLLAyer.SisyfosSourceVært_1_ST_B,
				content: {
					deviceType: DeviceType.SISYFOS,
					type: TimelineContentTypeSisyfos.SISYFOS,
					isPgm: voiceOverLevel ? 2 : 1
				}
			}),
			literal<TimelineObjSisyfosMessage>({
				id: '',
				enable: {
					start: 0
				},
				priority: 1,
				layer: SisyfosLLAyer.SisyfosSourceVært_2_ST_A,
				content: {
					deviceType: DeviceType.SISYFOS,
					type: TimelineContentTypeSisyfos.SISYFOS,
					isPgm: voiceOverLevel ? 2 : 1
				}
			}),
			literal<TimelineObjSisyfosMessage>({
				id: '',
				enable: {
					start: 0
				},
				priority: 1,
				layer: SisyfosLLAyer.SisyfosSourceVært_2_ST_B,
				content: {
					deviceType: DeviceType.SISYFOS,
					type: TimelineContentTypeSisyfos.SISYFOS,
					isPgm: voiceOverLevel ? 2 : 1
				}
			}),
			literal<TimelineObjSisyfosMessage>({
				id: '',
				enable: {
					start: 0
				},
				priority: 1,
				layer: SisyfosLLAyer.SisyfosSourceGæst_1_ST_A,
				content: {
					deviceType: DeviceType.SISYFOS,
					type: TimelineContentTypeSisyfos.SISYFOS,
					isPgm: voiceOverLevel ? 2 : 1
				}
			}),
			literal<TimelineObjSisyfosMessage>({
				id: '',
				enable: {
					start: 0
				},
				priority: 1,
				layer: SisyfosLLAyer.SisyfosSourceGæst_1_ST_B,
				content: {
					deviceType: DeviceType.SISYFOS,
					type: TimelineContentTypeSisyfos.SISYFOS,
					isPgm: voiceOverLevel ? 2 : 1
				}
			}),
			literal<TimelineObjSisyfosMessage>({
				id: '',
				enable: {
					start: 0
				},
				priority: 1,
				layer: SisyfosLLAyer.SisyfosSourceGæst_2_ST_A,
				content: {
					deviceType: DeviceType.SISYFOS,
					type: TimelineContentTypeSisyfos.SISYFOS,
					isPgm: voiceOverLevel ? 2 : 1
				}
			}),
			literal<TimelineObjSisyfosMessage>({
				id: '',
				enable: {
					start: 0
				},
				priority: 1,
				layer: SisyfosLLAyer.SisyfosSourceGæst_2_ST_B,
				content: {
					deviceType: DeviceType.SISYFOS,
					type: TimelineContentTypeSisyfos.SISYFOS,
					isPgm: voiceOverLevel ? 2 : 1
				}
			}),
			literal<TimelineObjSisyfosMessage>({
				id: '',
				enable: {
					start: 0
				},
				priority: 1,
				layer: SisyfosLLAyer.SisyfosSourceGæst_3_ST_A,
				content: {
					deviceType: DeviceType.SISYFOS,
					type: TimelineContentTypeSisyfos.SISYFOS,
					isPgm: voiceOverLevel ? 2 : 1
				}
			}),
			literal<TimelineObjSisyfosMessage>({
				id: '',
				enable: {
					start: 0
				},
				priority: 1,
				layer: SisyfosLLAyer.SisyfosSourceGæst_3_ST_B,
				content: {
					deviceType: DeviceType.SISYFOS,
					type: TimelineContentTypeSisyfos.SISYFOS,
					isPgm: voiceOverLevel ? 2 : 1
				}
			}),
			literal<TimelineObjSisyfosMessage>({
				id: '',
				enable: {
					start: 0
				},
				priority: 1,
				layer: SisyfosLLAyer.SisyfosSourceGæst_4_ST_A,
				content: {
					deviceType: DeviceType.SISYFOS,
					type: TimelineContentTypeSisyfos.SISYFOS,
					isPgm: voiceOverLevel ? 2 : 1
				}
			}),
			literal<TimelineObjSisyfosMessage>({
				id: '',
				enable: {
					start: 0
				},
				priority: 1,
				layer: SisyfosLLAyer.SisyfosSourceGæst_4_ST_B,
				content: {
					deviceType: DeviceType.SISYFOS,
					type: TimelineContentTypeSisyfos.SISYFOS,
					isPgm: voiceOverLevel ? 2 : 1
				}
			})
		)
	}
	return audioTimeline
}

export function GetSisyfosTimelineObjForEkstern(sourceType: string, voiceOverLevel: boolean): TSRTimelineObj[] {
	let audioTimeline: TSRTimelineObj[] = []
	let layer = SisyfosLLAyer.SisyfosSourceLive_1

	const eksternProps = sourceType.match(/^(?:LIVE|SKYPE) ([^\s]+)(?: (.+))?$/i)
	if (eksternProps) {
		const source = eksternProps[1]

		if (source) {
			switch (source) {
				case '1':
					layer = SisyfosLLAyer.SisyfosSourceLive_1
					break
				case '2':
					layer = SisyfosLLAyer.SisyfosSourceLive_2
					break
				case '3':
					layer = SisyfosLLAyer.SisyfosSourceLive_3
					break
				case '4':
					layer = SisyfosLLAyer.SisyfosSourceLive_4
					break
				case '5':
					layer = SisyfosLLAyer.SisyfosSourceLive_5
					break
				case '6':
					layer = SisyfosLLAyer.SisyfosSourceLive_6
					break
				case '7':
					layer = SisyfosLLAyer.SisyfosSourceLive_7
					break
				case '8':
					layer = SisyfosLLAyer.SisyfosSourceLive_8
					break
				case '9':
					layer = SisyfosLLAyer.SisyfosSourceLive_9
					break
				case '10':
					layer = SisyfosLLAyer.SisyfosSourceLive_10
					break
			}
			audioTimeline = [
				literal<TimelineObjSisyfosMessage>({
					id: '',
					enable: {
						start: 0
					},
					priority: 1,
					layer,
					content: {
						deviceType: DeviceType.SISYFOS,
						type: TimelineContentTypeSisyfos.SISYFOS,
						isPgm: voiceOverLevel ? 2 : 1
					}
				})
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
