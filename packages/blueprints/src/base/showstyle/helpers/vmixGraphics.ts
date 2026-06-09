import { TSR } from '@sofie-automation/blueprints-integration'
import { literal } from '../../../common/util.js'
import { StudioConfig, VmixGraphicsTargets } from '../../studio/helpers/config.js'
import {
	formatVmixMappingIndex,
	getVmixOverlayLayerId,
	isVmixProductionMode,
	resolveVmixInput,
} from '../../studio/helpers/vmixInputs.js'
import { VMixLayers } from '../../studio/layers.js'
import { TimelineBlueprintExt } from '../../studio/customTypes.js'
import { SourceLayer } from '../applyconfig/layers.js'

function getRegistryKeyForGraphicLayer(
	sourceLayer: SourceLayer,
	targets: VmixGraphicsTargets | undefined
): string | undefined {
	if (!targets) return undefined

	switch (sourceLayer) {
		case SourceLayer.LowerThird:
			return targets.lowerThird
		case SourceLayer.Strap:
			return targets.strap ?? targets.headline
		case SourceLayer.Ticker:
			return targets.ticker ?? targets.bug
		case SourceLayer.Logo:
			return targets.logo ?? targets.bug
		case SourceLayer.GFX:
			return targets.fullscreen
		default:
			return undefined
	}
}

export function getVmixGraphicOverlayLayer(config: StudioConfig, sourceLayer: SourceLayer): string | undefined {
	const registryKey = getRegistryKeyForGraphicLayer(sourceLayer, config.vmixGraphicsTargets)
	if (!registryKey) return undefined

	const registryEntry = resolveVmixInput(config, registryKey)
	if (!registryEntry?.overlay) return getVmixOverlayLayerId(registryKey)

	return getVmixOverlayLayerId(registryKey)
}

export function createVmixOverlayGraphicTimelineObjects(
	config: StudioConfig,
	sourceLayer: SourceLayer,
	_isAdlib?: boolean
): TimelineBlueprintExt<TSR.TimelineContentVMixOverlay>[] | undefined {
	if (!isVmixProductionMode(config)) return undefined

	const registryKey = getRegistryKeyForGraphicLayer(sourceLayer, config.vmixGraphicsTargets)
	if (!registryKey) return undefined

	const registryEntry = resolveVmixInput(config, registryKey)
	if (!registryEntry) return undefined

	const layer = registryEntry.overlay ? getVmixOverlayLayerId(registryKey) : VMixLayers.VMixOverlayGraphics

	return [
		literal<TimelineBlueprintExt<TSR.TimelineContentVMixOverlay>>({
			id: '',
			enable: { start: 0 },
			layer,
			priority: 1,
			content: {
				deviceType: TSR.DeviceType.VMIX,
				type: TSR.TimelineContentTypeVMix.OVERLAY,
				input: formatVmixMappingIndex(registryEntry.input) as number | string,
			},
		}),
	]
}

export function shouldUseVmixOverlayGraphics(config: StudioConfig, sourceLayer: SourceLayer): boolean {
	return createVmixOverlayGraphicTimelineObjects(config, sourceLayer) !== undefined
}
