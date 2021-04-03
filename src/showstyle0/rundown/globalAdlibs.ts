import {
	IBlueprintAdLibPiece,
	IShowStyleUserContext,
	PieceLifespan,
	TSR,
} from '@sofie-automation/blueprints-integration'
import { literal } from '../../common/util'
import { AtemSourceType, StudioConfig } from '../../studio0/helpers/config'
import { AtemLayers } from '../../studio0/layers'
import { getOutputLayerForSourceLayer, SourceLayer } from '../layers'

export function getGlobalAdlibs(context: IShowStyleUserContext): IBlueprintAdLibPiece[] {
	const config = context.getStudioConfig() as StudioConfig

	const makeCameraAdlib = (id: number, input: number): IBlueprintAdLibPiece => ({
		_rank: id,
		externalId: 'cam' + id,
		name: `Camera ${id + 1}`,
		lifespan: PieceLifespan.WithinPart,
		sourceLayerId: SourceLayer.Camera,
		outputLayerId: getOutputLayerForSourceLayer(SourceLayer.Camera),
		content: {
			timelineObjects: [
				literal<TSR.TimelineObjAtemME>({
					id: '',
					enable: { start: 0 },
					layer: AtemLayers.AtemMeProgram,
					content: {
						deviceType: TSR.DeviceType.ATEM,
						type: TSR.TimelineContentTypeAtem.ME,

						me: {
							input: input,
							transition: TSR.AtemTransitionStyle.CUT,
						},
					},
				}),
			],
		},
	})
	const makeRemoteAdlib = (id: number, input: number): IBlueprintAdLibPiece => ({
		_rank: 100 + id,
		externalId: 'rem' + id,
		name: `Remote ${id + 1}`,
		lifespan: PieceLifespan.WithinPart,
		sourceLayerId: SourceLayer.Remote,
		outputLayerId: getOutputLayerForSourceLayer(SourceLayer.Camera),
		content: {
			timelineObjects: [
				literal<TSR.TimelineObjAtemME>({
					id: '',
					enable: { start: 0 },
					layer: AtemLayers.AtemMeProgram,
					content: {
						deviceType: TSR.DeviceType.ATEM,
						type: TSR.TimelineContentTypeAtem.ME,

						me: {
							input: input,
							transition: TSR.AtemTransitionStyle.CUT,
						},
					},
				}),
			],
		},
	})

	return [
		...config.atemSources
			.filter((source) => source.type === AtemSourceType.Camera)
			.map((source, i) => makeCameraAdlib(i, source.input)),
		...config.atemSources
			.filter((source) => source.type === AtemSourceType.Remote)
			.map((source, i) => makeRemoteAdlib(i, source.input)),
	]
}
