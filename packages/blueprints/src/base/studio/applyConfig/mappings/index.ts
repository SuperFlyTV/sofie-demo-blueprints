import { BlueprintMappings, ICommonContext, LookaheadMode, TSR } from '@sofie-automation/blueprints-integration'
import { BlueprintConfig, VisionMixerDevice } from '../../helpers/config.js'
import { getVMixMappings } from './vmix.js'
import { getAtemMappings } from './atem.js'
import { getSisyfosMappings } from './sisyfos.js'
import { getCasparCGMappings } from './casparcg.js'
import { getOBSMappings } from './obs.js'
import { AbstractLayers, OGrafLayers } from '../../layers.js'
import { assertNever } from '../../../../common/util.js'

const OGRAF_DEVICE_ID = 'ograf0'
const OGRAF_RENDERER_ID = 'renderer-obs-main'

function makeOgrafRenderTarget(layerId: string): string {
	return JSON.stringify({ layerId })
}

function makeOgrafMapping(renderTarget: string): BlueprintMappings[string] {
	return {
		device: ((TSR.DeviceType as any).OGRAF ?? ('OGRAF' as TSR.DeviceType)) as TSR.DeviceType,
		deviceId: OGRAF_DEVICE_ID,
		lookahead: LookaheadMode.NONE,
		options: {
			mappingType: (TSR as any).MappingOgrafType?.RenderTarget ?? 'renderTarget',
			rendererId: OGRAF_RENDERER_ID,
			renderTarget,
		} as any,
	}
}

export function getMappingsDefaults(context: ICommonContext, config: BlueprintConfig): BlueprintMappings {
	const mappings: BlueprintMappings = {
		[AbstractLayers.CoreAbstract]: {
			device: TSR.DeviceType.ABSTRACT,
			deviceId: 'abstract0',
			lookahead: LookaheadMode.NONE,
			options: {},
		},
		[OGrafLayers.OGrafFullScreenLoad]: makeOgrafMapping(makeOgrafRenderTarget('layer-0')),
		[OGrafLayers.OGrafFullScreenPlay]: makeOgrafMapping(makeOgrafRenderTarget('layer-0')),
		[OGrafLayers.OGrafFullScreenStop]: makeOgrafMapping(makeOgrafRenderTarget('layer-0')),
		[OGrafLayers.OGrafOverlay1Load]: makeOgrafMapping(makeOgrafRenderTarget('layer-1')),
		[OGrafLayers.OGrafOverlay1Play]: makeOgrafMapping(makeOgrafRenderTarget('layer-1')),
		[OGrafLayers.OGrafOverlay1Stop]: makeOgrafMapping(makeOgrafRenderTarget('layer-1')),
		[OGrafLayers.OGrafOverlay2Load]: makeOgrafMapping(makeOgrafRenderTarget('layer-2')),
		[OGrafLayers.OGrafOverlay2Play]: makeOgrafMapping(makeOgrafRenderTarget('layer-2')),
		[OGrafLayers.OGrafOverlay2Stop]: makeOgrafMapping(makeOgrafRenderTarget('layer-2')),
		[OGrafLayers.OGrafOverlay3Load]: makeOgrafMapping(makeOgrafRenderTarget('layer-3')),
		[OGrafLayers.OGrafOverlay3Play]: makeOgrafMapping(makeOgrafRenderTarget('layer-3')),
		[OGrafLayers.OGrafOverlay3Stop]: makeOgrafMapping(makeOgrafRenderTarget('layer-3')),
	}

	switch (config.studio.visionMixer.type) {
		case VisionMixerDevice.Atem:
			Object.assign(mappings, getSisyfosMappings(config), getCasparCGMappings(config))
			Object.assign(mappings, getAtemMappings(config))
			break
		case VisionMixerDevice.VMix:
			Object.assign(mappings, getSisyfosMappings(config), getCasparCGMappings(config))
			Object.assign(mappings, getVMixMappings(config.studio.vmixSources))
			break
		case VisionMixerDevice.OBS:
			Object.assign(mappings, getOBSMappings(config.studio))
			break
		default:
			assertNever(config.studio.visionMixer.type)
			context.logError('Unknown vision mixer type: ' + config.studio.visionMixer.type)
			break
	}

	return mappings
}
