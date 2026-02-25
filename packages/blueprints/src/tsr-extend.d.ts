import type { FakeDeviceType, TimelineContentFakeAny, DeviceOptionsFake } from './test-types.js'

declare module 'timeline-state-resolver-types' {
	interface TimelineContentMap {
		[FakeDeviceType]: TimelineContentFakeAny
	}

	interface DeviceOptionsMap {
		[FakeDeviceType]: DeviceOptionsFake
	}
}
