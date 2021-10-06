import { BlueprintResultBaseline, IShowStyleUserContext, TSR } from '@sofie-automation/blueprints-integration'
import { literal } from '../../common/util'
import { AtemSourceType, StudioConfig } from '../../studio0/helpers/config'
import { AtemLayers, CasparCGLayers } from '../../studio0/layers'
import { DVEDesigns, DVELayouts } from '../helpers/dve'

export function getBaseline(context: IShowStyleUserContext): BlueprintResultBaseline {
	const config = context.getStudioConfig() as StudioConfig
	const dskInput = config.atemSources.find((source) => source.type === AtemSourceType.Graphics)

	return {
		timelineObjects: [
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
		]
	}
}
