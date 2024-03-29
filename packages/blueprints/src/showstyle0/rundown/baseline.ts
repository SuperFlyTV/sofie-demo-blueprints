import { BlueprintResultBaseline, IShowStyleUserContext, TSR } from '@sofie-automation/blueprints-integration'
import * as _ from 'underscore'
import { literal } from '../../common/util'
import { SourceType, StudioConfig, VisionMixerType } from '../../studio0/helpers/config'
import { AtemLayers, CasparCGLayers, SisyfosLayers, VMixLayers } from '../../studio0/layers'
import { getSisyfosBaseline } from '../helpers/audio'
import { DVEDesigns, DVELayouts } from '../helpers/dve'

export function getBaseline(context: IShowStyleUserContext): BlueprintResultBaseline {
	const config = context.getStudioConfig() as StudioConfig

	return {
		timelineObjects: _.compact([
			...(config.visionMixerType === VisionMixerType.Atem ? getAtemBaseline(config) : []),
			...(config.visionMixerType === VisionMixerType.VMix ? getVMixBaseline(config) : []),

			literal<TSR.TimelineObjCCGRoute>({
				id: '',
				enable: { while: 1 },
				priority: 0,
				layer: CasparCGLayers.CasparCGClipPlayerPreview,
				content: {
					deviceType: TSR.DeviceType.CASPARCG,
					type: TSR.TimelineContentTypeCasparCg.ROUTE,

					mappedLayer: CasparCGLayers.CasparCGClipPlayer,
					mode: 'BACKGROUND',
				},
			}),

			literal<TSR.TimelineObjSisyfosChannels>({
				id: '',
				enable: {
					while: 1,
				},
				layer: SisyfosLayers.Baseline,
				content: {
					deviceType: TSR.DeviceType.SISYFOS,
					type: TSR.TimelineContentTypeSisyfos.CHANNELS,
					overridePriority: -10,

					channels: getSisyfosBaseline(config),
				},
			}),
		]),
	}
}

function getAtemBaseline(config: StudioConfig): TSR.TSRTimelineObjBase[] {
	const dskInput = config.atemSources.find((source) => source.type === SourceType.Graphics)

	return [
		literal<TSR.TimelineObjAtemSsrcProps>({
			id: '',
			enable: { while: 1 },
			priority: 0,
			layer: AtemLayers.AtemSuperSourceProps,
			content: {
				deviceType: TSR.DeviceType.ATEM,
				type: TSR.TimelineContentTypeAtem.SSRCPROPS,
				ssrcProps: {
					artFillSource: 3010, // atem mediaplayer1
					artCutSource: 3011,
					artOption: 0, // bg art
					artPreMultiplied: true,
					borderEnabled: false,
				},
			},
		}),

		literal<TSR.TimelineObjAtemSsrc>({
			id: '',
			enable: { while: 1 },
			priority: 0,
			layer: AtemLayers.AtemSuperSourceBoxes,
			content: {
				deviceType: TSR.DeviceType.ATEM,
				type: TSR.TimelineContentTypeAtem.SSRC,

				ssrc: {
					boxes: [...DVEDesigns[DVELayouts.TwoBox]],
				},
			},
		}),

		literal<TSR.TimelineObjAtemDSK>({
			id: '',
			enable: { while: 1 },
			priority: 0,
			layer: AtemLayers.AtemDskGraphics,
			content: {
				deviceType: TSR.DeviceType.ATEM,
				type: TSR.TimelineContentTypeAtem.DSK,

				dsk: {
					onAir: true,
					sources: {
						fillSource: dskInput?.input || 0,
						cutSource: dskInput ? dskInput.input + 1 : 0,
					},
					properties: {
						preMultiply: true,
					},
				},
			},
		}),

		...config.atemOutputs.map((output) =>
			literal<TSR.TimelineObjAtemAUX>({
				id: '',
				enable: { while: 1 },
				priority: 0,
				layer: `atem_aux_${output.output - 1}`,
				content: {
					deviceType: TSR.DeviceType.ATEM,
					type: TSR.TimelineContentTypeAtem.AUX,

					aux: {
						input: output.source,
					},
				},
			})
		),
	]
}

function getVMixBaseline(config: StudioConfig): TSR.TSRTimelineObjBase[] {
	const dskInput = config.vmixSources.find((source) => source.type === SourceType.Graphics)

	return [
		literal<TSR.TimelineObjVMixOverlay>({
			id: '',
			enable: { while: 1 },
			priority: 0,
			layer: VMixLayers.VMixOverlayGraphics,
			content: {
				deviceType: TSR.DeviceType.VMIX,
				type: TSR.TimelineContentTypeVMix.OVERLAY,

				input: dskInput?.input || -1,
			},
		}),
	]
}
