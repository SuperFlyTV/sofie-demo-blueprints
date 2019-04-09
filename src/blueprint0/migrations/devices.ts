import * as _ from 'underscore'
import {
	MigrationContextStudio, MigrationStepInputFilteredResult, MigrationStepStudio, MigrationStepInput
} from 'tv-automation-sofie-blueprints-integration'
import {
	DeviceType as PlayoutDeviceType,
	DeviceOptions as PlayoutDeviceOptions
} from 'timeline-state-resolver-types'
import { literal } from '../../common/util'

declare const VERSION: string // Injected by webpack

interface DeviceEntry {
	id: string
	firstVersion: string
	type: PlayoutDeviceType
	defaultValue: (input: MigrationStepInputFilteredResult, context: MigrationContextStudio) => PlayoutDeviceOptions | undefined
	input?: MigrationStepInput[]
	validate?: (device: PlayoutDeviceOptions) => string | boolean
	createDependsOn?: string,
	createCondition?: (context: MigrationContextStudio) => boolean
}

function validateDevice (spec: DeviceEntry): MigrationStepStudio {
	return {
		id: `Playout-gateway.${spec.id}.validate`,
		version: VERSION,
		canBeRunAutomatically: false,
		validate: (context: MigrationContextStudio) => {
			const dev = context.getDevice(spec.id)
			if (!dev) return false
			if (dev.type !== spec.type) return `Type is not "${PlayoutDeviceType[spec.type]}"`

			if (spec.validate) {
				return spec.validate(dev)
			}

			return false
		},
		input: [{
			label: `Playout-gateway: device "${spec.id}" misconfigured`,
			description: `Go into the settings of the Playout-gateway and setup the device "${spec.id}". ($validation)`,
			inputType: null,
			attribute: null
		}]
	}
}
function createDevice (spec: DeviceEntry): MigrationStepStudio {
	return {
		id: `Playout-gateway.${spec.id}.create`,
		version: spec.firstVersion,
		canBeRunAutomatically: spec.input === undefined,
		validate: (context: MigrationContextStudio) => {
			if (spec.createCondition && !spec.createCondition(context)) return false

			const dev = context.getDevice(spec.id)
			if (!dev) return `"${spec.id}" missing`

			return false
		},
		migrate: (context: MigrationContextStudio, input: MigrationStepInputFilteredResult) => {
			if (spec.createCondition && !spec.createCondition(context)) return

			const dev = context.getDevice(spec.id)
			if (!dev) {
				let options = spec.defaultValue(input, context)
				if (options) {
					context.insertDevice(spec.id, options)
				}
			}
		},
		input: spec.input,
		dependOnResultFrom: spec.createDependsOn
	}
}

const devices: DeviceEntry[] = [
	{
		id: 'abstract0',
		firstVersion: '0.1.0',
		type: PlayoutDeviceType.ABSTRACT,
		defaultValue: () => ({
			type: PlayoutDeviceType.ABSTRACT,
			options: {}
		})
	},
	{
		id: 'caspar01',
		firstVersion: '0.1.0',
		type: PlayoutDeviceType.CASPARCG,
		defaultValue: (input) => ({
			type: PlayoutDeviceType.CASPARCG,
			options: {
				host: input.host,
				port: 5250,
				launcherHost: input.host,
				launcherPort: 8005
			}
		}),
		input: [{
			label: 'Device config caspar01: Host',
			description: 'Enter the Host paramter, example: "127.0.0.1"',
			inputType: 'text',
			attribute: 'host',
			defaultValue: undefined
		}],
		validate: device => {
			if (!device.options) return 'Missing options'

			const opts = device.options as any
			if (!opts.host) return 'Host is not set'
			if (!opts.launcherHost) return 'Launcher host is not set'

			return false
		},
		createDependsOn: 'studioConfig.DevicePrefix'
	},
	{
		id: 'caspar01-launcher',
		firstVersion: '0.1.0',
		type: PlayoutDeviceType.HTTPWATCHER,
		defaultValue: (_input: MigrationStepInputFilteredResult, context: MigrationContextStudio) => {
			const mainDev = context.getDevice('caspar01')
			if (mainDev && mainDev.options) {
				const mainOpts = mainDev.options as any
				if (mainOpts.launcherHost) {
					return {
						type: PlayoutDeviceType.HTTPWATCHER,
						options: {
							uri : `http://${mainOpts.launcherHost}:${mainOpts.launcherPort || 8005}/processes`,
							httpMethod : 'GET',
							expectedHttpResponse : 200,
							interval : 30000
						}
					}
				}
			}
			return undefined
		},
		validate: device => {
			if (!device.options) return 'Missing options'

			const opts = device.options as any
			if (!opts.uri) return 'URI is not set'
			if (!opts.httpMethod) return 'HTTP Method is not set'
			if (!opts.expectedHttpResponse) return 'Expected response is not set'
			if (!opts.interval) return 'Inteval is not set'

			return false
		},
		createDependsOn: 'Playout-gateway.caspar01.create'
	},
	{
		id: 'caspar01-scanner',
		firstVersion: '0.1.0',
		type: PlayoutDeviceType.HTTPWATCHER,
		defaultValue: (_input: MigrationStepInputFilteredResult, context: MigrationContextStudio) => {
			const mainDev = context.getDevice('caspar01')
			if (mainDev && mainDev.options) {
				const mainOpts = mainDev.options as any
				if (mainOpts.launcherHost) {
					return {
						type: PlayoutDeviceType.HTTPWATCHER,
						options: {
							uri : `http://${mainOpts.host}:8000/stat/seq`,
							httpMethod : 'GET',
							expectedHttpResponse : 200,
							interval : 30000
						}
					}
				}
			}
			return undefined
		},
		validate: device => {
			if (!device.options) return 'Missing options'

			const opts = device.options as any
			if (!opts.uri) return 'URI is not set'
			if (!opts.httpMethod) return 'HTTP Method is not set'
			if (!opts.expectedHttpResponse) return 'Expected response is not set'
			if (!opts.interval) return 'Inteval is not set'

			return false
		},
		createDependsOn: 'Playout-gateway.caspar01.create'
	},
	{
		id: 'atem0',
		firstVersion: '0.1.0',
		type: PlayoutDeviceType.ATEM,
		defaultValue: (input) => ({
			type: PlayoutDeviceType.ATEM,
			options: {
				host: input.host,
				port: 9910
			}
		}),
		input: [{
			label: 'Device config atem0: Host',
			description: 'Enter the Host paramter, example: "127.0.0.1"',
			inputType: 'text',
			attribute: 'host',
			defaultValue: undefined
		}],
		validate: device => {
			if (!device.options) return 'Missing options'

			const opts = device.options as any
			if (!opts.host) return 'Host is not set'

			return false
		}
	},
	{
		id: 'http0',
		firstVersion: '0.1.0',
		type: PlayoutDeviceType.HTTPSEND,
		defaultValue: () => ({
			type: PlayoutDeviceType.HTTPSEND,
			options: {
				makeReadyCommands: []
			}
		})
	},
	{
		id: 'hyperdeck0',
		firstVersion: '0.1.0',
		type: PlayoutDeviceType.HYPERDECK,
		defaultValue: (input) => ({
			type: PlayoutDeviceType.HYPERDECK,
			options: {
				host: input.host,
				port: 9993
			}
		}),
		input: [{
			label: 'Device config hyperdeck0: Host',
			description: 'Enter the Host paramter, example: "127.0.0.1"',
			inputType: 'text',
			attribute: 'host',
			defaultValue: undefined
		}],
		validate: device => {
			if (!device.options) return 'Missing options'

			const opts = device.options as any
			if (!opts.host) return 'Host is not set'

			return false
		}
	}
]

export const deviceMigrations = literal<MigrationStepStudio[]>([
	// create all devices
	..._.map(devices, createDevice),

	// ensureMakeReadyIsUpToDate('http0', 'nora-reset-stage', () => ({})),

	// ensure all devices still look valid
	..._.map(devices, validateDevice)
])

// function ensureMakeReadyIsUpToDate (deviceId: string, cmdId: string, getExpectedCommand: (context: MigrationContextStudio, deviceId: string, cmdId: string) => any) {
// 	return literal<MigrationStepStudio>({
// 		id: `Playout-gateway.${deviceId}.make-ready.${cmdId}`,
// 		version: VERSION, // Always run to ensure up-to-date
// 		dependOnResultFrom: `Playout-gateway.${deviceId}.create`,
// 		canBeRunAutomatically: true,
// 		validate: (context: MigrationContextStudio) => {
// 			const expected = getExpectedCommand(context, deviceId, cmdId)
// 			if (!expected) return false

// 			const dev = context.getDevice(deviceId)
// 			if (!dev) return `"${deviceId}" missing`

// 			const opts = dev.options as any
// 			if (!opts || !opts.makeReadyCommands || opts.makeReadyCommands.length === 0) return `"${deviceId}" missing ${cmdId}`

// 			const cmd = opts.makeReadyCommands.find((c: any) => c.id === cmdId)
// 			if (!cmd) return `"${deviceId}" missing ${cmdId}`

// 			if (!_.isEqual(cmd, expected)) return `"${deviceId}" ${cmdId}: current value does not match expected`

// 			return false
// 		},
// 		migrate: (context: MigrationContextStudio) => {
// 			const dev = context.getDevice(deviceId)
// 			const expected = getExpectedCommand(context, deviceId, cmdId)

// 			if (dev && expected) {
// 				const opts = dev.options as any
// 				if (!opts.makeReadyCommands) opts.makeReadyCommands = []

// 				const i = opts.makeReadyCommands.findIndex((c: any) => c.id === cmdId)
// 				if (i === -1) {
// 					opts.makeReadyCommands.push(expected)
// 				} else {
// 					opts.makeReadyCommands[i] = expected
// 				}

// 				context.updateDevice(deviceId, { options: opts })
// 			}
// 		}
// 	})
// }
