import { BlueprintMappings, BlueprintMapping, TSR, LookaheadMode } from '@sofie-automation/blueprints-integration'
import { literal } from '../../../../common/util.js'
import { BlueprintConfig } from '../../helpers/config.js'
import { OGrafLayers } from '../../layers.js'

export function getOGrafMappings(_config: BlueprintConfig): BlueprintMappings {
	const mappings: BlueprintMappings = {
		[OGrafLayers.OGrafFullScreen]: literal<BlueprintMapping<TSR.MappingOgrafRenderTarget>>({
			device: TSR.DeviceType.OGRAF,
			deviceId: 'ograf0',
			lookahead: LookaheadMode.NONE,

			options: {
				mappingType: TSR.MappingOgrafType.RenderTarget,
				rendererId: 'renderer-1',
				renderTarget: '{"layerId": "layer-0"}',
			},
		}),
		[OGrafLayers.OGrafOverlay1]: literal<BlueprintMapping<TSR.MappingOgrafRenderTarget>>({
			device: TSR.DeviceType.OGRAF,
			deviceId: 'ograf0',
			lookahead: LookaheadMode.NONE,

			options: {
				mappingType: TSR.MappingOgrafType.RenderTarget,
				rendererId: 'renderer-1',
				renderTarget: '{"layerId": "layer-1"}',
			},
		}),
		[OGrafLayers.OGrafOverlay2]: literal<BlueprintMapping<TSR.MappingOgrafRenderTarget>>({
			device: TSR.DeviceType.OGRAF,
			deviceId: 'ograf0',
			lookahead: LookaheadMode.NONE,

			options: {
				mappingType: TSR.MappingOgrafType.RenderTarget,
				rendererId: 'renderer-1',
				renderTarget: '{"layerId": "layer-2"}',
			},
		}),
		[OGrafLayers.OGrafOverlay3]: literal<BlueprintMapping<TSR.MappingOgrafRenderTarget>>({
			device: TSR.DeviceType.OGRAF,
			deviceId: 'ograf0',
			lookahead: LookaheadMode.NONE,

			options: {
				mappingType: TSR.MappingOgrafType.RenderTarget,
				rendererId: 'renderer-1',
				renderTarget: '{"layerId": "layer-3"}',
			},
		}),
		[OGrafLayers.OGrafStudio1]: literal<BlueprintMapping<TSR.MappingOgrafRenderTarget>>({
			device: TSR.DeviceType.OGRAF,
			deviceId: 'ograf0',
			lookahead: LookaheadMode.NONE,

			options: {
				mappingType: TSR.MappingOgrafType.RenderTarget,
				rendererId: 'renderer-studio-1',
				renderTarget: '{"layerId": "layer-0"}',
			},
		}),
		[OGrafLayers.OGrafStudio2]: literal<BlueprintMapping<TSR.MappingOgrafRenderTarget>>({
			device: TSR.DeviceType.OGRAF,
			deviceId: 'ograf0',
			lookahead: LookaheadMode.NONE,

			options: {
				mappingType: TSR.MappingOgrafType.RenderTarget,
				rendererId: 'renderer-studio-2',
				renderTarget: '{"layerId": "layer-0"}',
			},
		}),
		[OGrafLayers.OGrafStudio3]: literal<BlueprintMapping<TSR.MappingOgrafRenderTarget>>({
			device: TSR.DeviceType.OGRAF,
			deviceId: 'ograf0',
			lookahead: LookaheadMode.NONE,

			options: {
				mappingType: TSR.MappingOgrafType.RenderTarget,
				rendererId: 'renderer-studio-3',
				renderTarget: '{"layerId": "layer-0"}',
			},
		}),
	}

	return mappings
}
