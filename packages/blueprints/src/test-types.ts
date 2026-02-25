import { DeviceOptionsBase } from 'timeline-state-resolver-types'

export const FakeDeviceType = 'fake' as const

export declare enum TimelineContentTypeFake {
	AUX = 'aux',
}

export type TimelineContentFakeAny = TimelineContentFakeAUX

export interface TimelineContentFakeBase {
	deviceType: typeof FakeDeviceType
	type: TimelineContentTypeFake
}

export interface TimelineContentFakeAUX extends TimelineContentFakeBase {
	type: TimelineContentTypeFake.AUX
	aux: {
		input: number
	}
}

export type DeviceOptionsFake = DeviceOptionsBase<
	typeof FakeDeviceType,
	{
		abc: number
	}
>
