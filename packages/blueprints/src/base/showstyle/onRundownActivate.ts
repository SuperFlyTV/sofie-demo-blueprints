import { BlueprintMapping, IRundownActivationContext, TSR } from '@sofie-automation/blueprints-integration'

export default async function onRundownActivate(context: IRundownActivationContext): Promise<void> {
	const clearGraphicsAction = (TSR as any).OgrafActions?.ClearGraphics
	if (!clearGraphicsAction) return

	const mappings = context.getStudioMappings()
	const devices = await context.listPlayoutDevices()

	for (const device of devices) {
		if (`${device.deviceType}` !== (((TSR.DeviceType as any).OGRAF ?? 'OGRAF') as string)) continue

		for (const mapping of Object.values<BlueprintMapping>(mappings)) {
			if (`${mapping.device}` !== (((TSR.DeviceType as any).OGRAF ?? 'OGRAF') as string)) continue
			if (mapping.deviceId !== `${device.deviceId}`) continue

			const mappingType = (mapping.options as any)?.mappingType
			if (mappingType !== ((TSR as any).MappingOgrafType?.RenderTarget ?? 'renderTarget')) continue

			await context.executeTSRAction(device.deviceId, clearGraphicsAction, {
				renderTarget: (mapping.options as any).renderTarget,
			} as any)
		}
	}
}
