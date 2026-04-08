import { IRundownActivationContext } from '@sofie-automation/blueprints-integration'

export default async function onRundownActivate(_context: IRundownActivationContext): Promise<void> {
	// Clear OGraf renderers:
	// const mappings = context.getStudioMappings()
	// const devices = await context.listPlayoutDevices()
	// for (const device of devices) {
	// 	if (device.deviceType === TSR.DeviceType.OGRAF) {
	// 		for (const mapping of Object.values<BlueprintMapping>(mappings)) {
	// 			if (mapping.device !== TSR.DeviceType.OGRAF) continue
	// 			if (mapping.deviceId === `${device.deviceId}`) {
	// 				if (mapping.options.mappingType === TSR.MappingOgrafType.RenderTarget) {
	// 					await context.executeTSRAction(device.deviceId, TSR.OgrafActions.ClearGraphics, {
	// 						renderTarget: mapping.options.renderTarget,
	// 					})
	// 				}
	// 			}
	// 		}
	// 	}
	// }
}
