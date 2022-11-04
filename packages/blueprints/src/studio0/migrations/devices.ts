import {
	MigrationContextStudio,
	MigrationStepInput,
	MigrationStepInputFilteredResult,
	MigrationStepStudio,
	TSR,
} from '@sofie-automation/blueprints-integration'
import * as _ from 'underscore'
import { literal } from '../../common/util'
import { VisionMixerType } from '../helpers/config'

declare const VERSION: string // Injected by webpack

export interface DeviceEntry {
	id: string
	firstVersion: string
	type: TSR.DeviceType
	defaultValue: (
		input: MigrationStepInputFilteredResult,
		context: MigrationContextStudio
	) => TSR.DeviceOptionsAny | undefined
	input?: MigrationStepInput[]
	validate?: (device: TSR.DeviceOptionsAny) => string | boolean
	createDependsOn?: string
	createCondition?: (context: MigrationContextStudio) => boolean
}

const devices: DeviceEntry[] = [
	{
		id: 'abstract0',
		firstVersion: '0.1.0',
		type: TSR.DeviceType.ABSTRACT,
		defaultValue: (): TSR.DeviceOptionsAbstract => ({
			type: TSR.DeviceType.ABSTRACT,
			options: {},
		}),
	},
	{
		id: 'atem0',
		firstVersion: '0.1.0',
		type: TSR.DeviceType.ATEM,
		defaultValue: (input): TSR.DeviceOptionsAtem => ({
			type: TSR.DeviceType.ATEM,
			options: literal<TSR.AtemOptions>({
				host: input.host,
				port: 9910,
			}),
		}),
		input: [
			{
				label: 'Device config atem0: Host',
				description: 'Enter the Host parameter, example: "127.0.0.1"',
				inputType: 'text',
				attribute: 'host',
				defaultValue: undefined,
			},
		],
		validate: (device): string | boolean => {
			if (!device.options) {
				return 'Missing options'
			}

			const opts = device.options as TSR.AtemOptions
			if (!opts.host) {
				return 'Host is not set'
			}

			return false
		},
		createCondition: (ctx) => ctx.getConfig('visionMixerType') === VisionMixerType.Atem,
	},
	{
		id: 'vmix0',
		firstVersion: '0.3.0',
		type: TSR.DeviceType.VMIX,
		defaultValue: (input): TSR.DeviceOptionsVMix => ({
			type: TSR.DeviceType.VMIX,
			options: literal<TSR.VMixOptions>({
				host: input.host,
				port: 8088,
			}),
		}),
		input: [
			{
				label: 'Device config vmix0: Host',
				description: 'Enter the Host parameter, example: "127.0.0.1"',
				inputType: 'text',
				attribute: 'host',
				defaultValue: undefined,
			},
		],
		validate: (device): string | boolean => {
			if (!device.options) {
				return 'Missing options'
			}

			const opts = device.options as TSR.VMixOptions
			if (!opts.host) {
				return 'Host is not set'
			}

			return false
		},
		createCondition: (ctx) => ctx.getConfig('visionMixerType') === VisionMixerType.VMix,
	},
	{
		id: 'casparcg0',
		firstVersion: '0.1.0',
		type: TSR.DeviceType.CASPARCG,
		defaultValue: (input): TSR.DeviceOptionsCasparCG => ({
			type: TSR.DeviceType.CASPARCG,
			options: literal<TSR.CasparCGOptions>({
				host: input.host,
				port: 5250,
			}),
		}),
		input: [
			{
				label: 'Device config casparcg0: Host',
				description: 'Enter the Host paramter, example: "127.0.0.1"',
				inputType: 'text',
				attribute: 'host',
				defaultValue: undefined,
			},
		],
		validate: (device): string | boolean => {
			if (!device.options) {
				return 'Missing options'
			}

			const opts = device.options as TSR.AtemOptions
			if (!opts.host) {
				return 'Host is not set'
			}

			return false
		},
	},
	{
		id: 'sisyfos0',
		firstVersion: '0.1.0',
		type: TSR.DeviceType.SISYFOS,
		defaultValue: (input): TSR.DeviceOptionsSisyfos => ({
			type: TSR.DeviceType.SISYFOS,
			options: literal<TSR.SisyfosOptions>({
				host: input.host,
				port: 5255,
			}),
		}),
		input: [
			{
				label: 'Device config sisyfos0: Host',
				description: 'Enter the Host parameter, example: "127.0.0.1"',
				inputType: 'text',
				attribute: 'host',
				defaultValue: undefined,
			},
		],
		validate: (device): string | boolean => {
			if (!device.options) {
				return 'Missing options'
			}

			const opts = device.options as TSR.SisyfosOptions
			if (!opts.host) {
				return 'Host is not set'
			}

			return false
		},
	},
]

export const deviceMigrations = literal<MigrationStepStudio[]>([
	// create all devices
	...devices.map((d) => createDevice(d)),

	// ensure all devices still look valid
	...devices.map((d) => validateDevice(VERSION, d)),
])

export function validateDevice(version: string, spec: DeviceEntry): MigrationStepStudio {
	return {
		id: `Playout-gateway.${spec.id}.validate`,
		version: version,
		canBeRunAutomatically: false,
		validate: (context: MigrationContextStudio): boolean | string => {
			const dev = context.getDevice(spec.id)
			if (!dev) {
				return false
			}
			if (dev.type !== spec.type) {
				return `Type is not "${TSR.DeviceType[spec.type]}"`
			}

			if (spec.validate) {
				return spec.validate(dev)
			}

			return false
		},
		input: [
			{
				label: `Playout-gateway: device "${spec.id}" misconfigured`,
				description: `Go into the settings of the Playout-gateway and setup the device "${spec.id}". ($validation)`,
				inputType: null,
				attribute: null,
			},
		],
	}
}

export function createDevice(spec: DeviceEntry): MigrationStepStudio {
	return {
		id: `Playout-gateway.${spec.id}.create`,
		version: spec.firstVersion,
		canBeRunAutomatically: spec.input === undefined,
		validate: (context: MigrationContextStudio): boolean | string => {
			if (spec.createCondition && !spec.createCondition(context)) {
				return false
			}

			const dev = context.getDevice(spec.id)
			if (!dev) {
				return `"${spec.id}" missing`
			}

			return false
		},
		migrate: (context: MigrationContextStudio, input: MigrationStepInputFilteredResult): void => {
			if (spec.createCondition && !spec.createCondition(context)) {
				return
			}

			const dev = context.getDevice(spec.id)
			if (!dev) {
				const options = spec.defaultValue(input, context)
				if (options) {
					context.insertDevice(spec.id, options)
				}
			}
		},
		input: spec.input,
		dependOnResultFrom: spec.createDependsOn,
	}
}

export function updateDeviceId(
	oldDeviceId: string,
	version: string,
	translateDeviceId: (context: MigrationContextStudio, id: string) => string
): MigrationStepStudio {
	return {
		id: `Playout-gateway.${oldDeviceId}.rename`,
		version,
		canBeRunAutomatically: true,
		validate: (context: MigrationContextStudio): boolean | string => {
			const deviceId = translateDeviceId(context, oldDeviceId)

			const dev = context.getDevice(deviceId)
			if (dev) {
				return false
			} // New dev already exists

			const oldDev = context.getDevice(oldDeviceId)
			if (oldDev) {
				return `"${deviceId}" needs renaming`
			}

			return false
		},
		migrate: (context: MigrationContextStudio): void => {
			const deviceId = translateDeviceId(context, oldDeviceId)

			const oldDev = context.getDevice(oldDeviceId)
			if (oldDev) {
				context.insertDevice(deviceId, oldDev)
				context.removeDevice(oldDeviceId)
			}
		},
		dependOnResultFrom: 'studioConfig.DevicePrefix',
	}
}

export function ensureMakeReadyIsUpToDate(
	version: string,
	deviceId: string,
	cmdId: string,
	getExpectedCommand: (context: MigrationContextStudio, deviceId: string, cmdId: string) => any
): MigrationStepStudio {
	return {
		id: `Playout-gateway.${deviceId}.make-ready.${cmdId}`,
		version: version, // Always run to ensure up-to-date
		dependOnResultFrom: `Playout-gateway.${deviceId}.create`,
		canBeRunAutomatically: true,
		validate: (context: MigrationContextStudio): boolean | string => {
			const expected = getExpectedCommand(context, deviceId, cmdId)
			if (!expected) {
				return false
			}

			const dev = context.getDevice(deviceId)
			if (!dev) {
				return `"${deviceId}" missing`
			}

			const opts = dev.options as Partial<TSR.DeviceOptionsHTTPSend['options']>
			if (!opts || !opts.makeReadyCommands || opts.makeReadyCommands.length === 0) {
				return `"${deviceId}" missing ${cmdId}`
			}

			const cmd = opts.makeReadyCommands.find((c: any) => c.id === cmdId)
			if (!cmd) {
				return `"${deviceId}" missing ${cmdId}`
			}

			if (!(_.isEqual(cmd, expected) || JSON.stringify(cmd) === JSON.stringify(expected))) {
				return `"${deviceId}" ${cmdId}: current value (${JSON.stringify(
					cmd
				)}) does not match expected (${JSON.stringify(expected)})`
			}

			return false
		},
		migrate: (context: MigrationContextStudio): void => {
			const dev = context.getDevice(deviceId)
			const expected = getExpectedCommand(context, deviceId, cmdId)

			if (dev && expected) {
				const opts = (dev.options as Partial<TSR.DeviceOptionsHTTPSend['options']>) || {}
				if (!opts.makeReadyCommands) {
					opts.makeReadyCommands = []
				}

				const i = opts.makeReadyCommands.findIndex((c: any) => c.id === cmdId)
				if (i === -1) {
					opts.makeReadyCommands.push(expected)
				} else {
					opts.makeReadyCommands[i] = expected
				}

				context.updateDevice(deviceId, { options: opts })
			}
		},
	}
}
