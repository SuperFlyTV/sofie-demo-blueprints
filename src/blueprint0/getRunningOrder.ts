import * as _ from 'underscore'

import {
	Timeline,
	IBlueprintSegmentLineAdLibItem,
	SegmentLineItemLifespan,
	RunningOrderContext,
	SourceLayerType,
	IStudioContext,
	IngestRunningOrder,
	BlueprintResultRunningOrder,
	IBlueprintRunningOrder
} from 'tv-automation-sofie-blueprints-integration'
import { AtemSourceIndex } from '../types/atem'
import {
	TimelineContentTypeCasparCg,
	TimelineObjCCGHTMLPage,
	TimelineObjCCGRoute,
	TimelineObjCCGVideo,
	TimelineContentTypeAtem,
	AtemTransitionStyle,
	TimelineObjAtemME,
	TimelineObjAtemAUX,
	TimelineObjAtemDSK,
	TimelineObjAtemSsrc,
	TimelineObjAtemSsrcProps,
	TimelineObjectAny,
	TimelineContentTypeHyperdeck,
	TimelineObjHyperdeckTransport,
	HyperdeckTransportStatus,
	Transition
} from 'timeline-state-resolver-types'

import { literal } from '../common/util'

import { CasparLLayer, SourceLayer, AtemLLayer, HyperdeckLLayer } from '../types/layers'
import { Constants } from '../types/constants'

import { parseConfig, BlueprintConfig } from './helpers/config'
import { parseSources, SourceInfo } from './helpers/sources'

export default function (context: IStudioContext, ingestRunningOrder: IngestRunningOrder): BlueprintResultRunningOrder | null {
	// TODO - this needs a different context

	const variants = context.getShowStyleVariants('show0')
	const variant = _.first(variants)
	if (variant) {
		const config = parseConfig(context)

		return {
			runningOrder: literal<IBlueprintRunningOrder>({
				externalId: ingestRunningOrder.externalId,
				name: ingestRunningOrder.name,
				expectedStart: 0,
				expectedDuration: 0,
				showStyleVariantId: variant._id
			}),
			globalAdLibPieces: getGlobalAdLibPieces(context, config),
			baseline: getBaseline(config)
		}
	} else {
		return null
	}
}

function getGlobalAdLibPieces (context: RunningOrderContext, config: BlueprintConfig) {
	const sources = parseSources(context, config)

	function makeCameraAdLib (info: SourceInfo, rank: number): IBlueprintSegmentLineAdLibItem {
		return {
			externalId: 'cam',
			name: info.id + '',
			_rank: rank || 0,
			sourceLayerId: SourceLayer.PgmCam,
			outputLayerId: 'pgm0',
			expectedDuration: 0,
			infiniteMode: SegmentLineItemLifespan.OutOnNextSegmentLine,
			content: {
				timelineObjects: _.compact<TimelineObjectAny>([
					literal<TimelineObjAtemME>({
						id: '',
						trigger: { type: Timeline.TriggerType.TIME_ABSOLUTE, value: 0 },
						priority: 1,
						duration: 0,
						LLayer: AtemLLayer.AtemMEProgram,
						content: {
							type: TimelineContentTypeAtem.ME,
							attributes: {
								input: info.port,
								transition: AtemTransitionStyle.CUT
							}
						}
					})
				])
			}
		}
	}

	let adlibItems: IBlueprintSegmentLineAdLibItem[] = []
	_.each(sources, v => {
		if (v.type === SourceLayerType.CAMERA) {
			adlibItems.push(makeCameraAdLib(v, (100 + v.id)))
		}
	})

}

function getBaseline (config: BlueprintConfig): Timeline.TimelineObject[] {
	return [
		// Default timeline
		literal<TimelineObjAtemME>({
			id: '',
			trigger: { type: Timeline.TriggerType.LOGICAL, value: '1' },
			priority: 0, duration: 0,
			LLayer: AtemLLayer.AtemMEProgram,
			content: {
				type: TimelineContentTypeAtem.ME,
				attributes: {
					input: config.studio.AtemSource.Default,
					transition: AtemTransitionStyle.CUT
				}
			}
		}),
		literal<TimelineObjAtemAUX>({
			id: '',
			trigger: { type: Timeline.TriggerType.LOGICAL, value: '1' },
			priority: 0, duration: 0,
			LLayer: AtemLLayer.AtemAuxLookahead,
			content: {
				type: TimelineContentTypeAtem.AUX,
				attributes: {
					input: config.studio.AtemSource.Default
				}
			}
		}),
		literal<TimelineObjAtemAUX>({
			id: '',
			trigger: { type: Timeline.TriggerType.LOGICAL, value: '1' },
			priority: 0, duration: 0,
			LLayer: AtemLLayer.AtemAuxSSrc,
			content: {
				type: TimelineContentTypeAtem.AUX,
				attributes: {
					input: AtemSourceIndex.SSrc
				}
			}
		}),
		literal<TimelineObjAtemAUX>({
			id: '',
			trigger: { type: Timeline.TriggerType.LOGICAL, value: '1' },
			priority: 0, duration: 0,
			LLayer: AtemLLayer.AtemAuxClean,
			content: {
				type: TimelineContentTypeAtem.AUX,
				attributes: {
					input: AtemSourceIndex.Cfd1
				}
			}
		}),
		literal<TimelineObjAtemDSK>({
			id: '',
			trigger: { type: Timeline.TriggerType.LOGICAL, value: '1' },
			priority: 0, duration: 0,
			LLayer: AtemLLayer.AtemDSKGraphics,
			content: {
				type: TimelineContentTypeAtem.DSK,
				attributes: {
					onAir: true,
					sources: {
						fillSource: config.studio.AtemSource.DSK1F,
						cutSource: config.studio.AtemSource.DSK1K
					},
					properties: {
						tie: false,
						preMultiply: true,
						mask: {
							enabled: false
						}
					}
				}
			}
		}),
		literal<TimelineObjAtemDSK>({
			id: '',
			trigger: { type: Timeline.TriggerType.LOGICAL, value: '1' },
			priority: 0, duration: 0,
			LLayer: AtemLLayer.AtemDSKEffect,
			content: {
				type: TimelineContentTypeAtem.DSK,
				attributes: {
					onAir: true,
					sources: {
						fillSource: config.studio.AtemSource.DSK2F,
						cutSource: config.studio.AtemSource.DSK2K
					},
					properties: {
						tie: false,
						preMultiply: true,
						mask: {
							enabled: false
						}
					}
				}
			}
		}),
		literal<TimelineObjAtemSsrcProps>({
			id: '',
			trigger: { type: Timeline.TriggerType.LOGICAL, value: '1' },
			priority: 0,
			duration: 0,
			LLayer: AtemLLayer.AtemSSrcArt,
			content: {
				type: TimelineContentTypeAtem.SSRCPROPS,
				attributes: {
					artFillSource: config.studio.AtemSource.SplitArtF,
					artCutSource: config.studio.AtemSource.SplitArtK,
					artOption: 1, // foreground
					artPreMultiplied: true
				}
			}
		}),
		literal<TimelineObjAtemSsrc>({
			id: '',
			trigger: { type: Timeline.TriggerType.LOGICAL, value: '1' },
			priority: 0,
			duration: 0,
			LLayer: AtemLLayer.AtemSSrcDefault,
			content: {
				type: TimelineContentTypeAtem.SSRC,
				attributes: {
					boxes: [
						{ // left
							enabled: true,
							source: AtemSourceIndex.Bars,
							size: 580,
							x: -800,
							y: 50,
							cropped: true,
							cropRight: 2000
						},
						{ // right
							enabled: true,
							source: AtemSourceIndex.Bars,
							size: 580,
							x: 800,
							y: 50
							// note: this sits behind box1, so don't crop it to ensure there is no gap between
						},
						{ // box 3
							enabled: false
						},
						{ // box 4
							enabled: false
						}
					]
				}
			}
		}),

		literal<TimelineObjCCGVideo>({
			id: '',
			trigger: { type: Timeline.TriggerType.LOGICAL, value: '1' },
			priority: 0, duration: 0,
			LLayer: CasparLLayer.CasparPlayerClip,
			content: {
				type: TimelineContentTypeCasparCg.VIDEO,
				attributes: {
					file: 'EMPTY'
				},
				mixer: {
					opacity: 0
				},
				transitions: {
					inTransition: {
						type: Transition.CUT,
						duration: Constants.DefaultClipFadeOut
					}
				}
			}
		}),
		literal<TimelineObjCCGRoute>({
			id: '',
			trigger: { type: Timeline.TriggerType.LOGICAL, value: '1' },
			priority: 0, duration: 0,
			LLayer: CasparLLayer.CasparPlayerClipNext,
			content: {
				type: TimelineContentTypeCasparCg.ROUTE,
				attributes: {
					LLayer: CasparLLayer.CasparPlayerClip,
					mode: 'BACKGROUND'
				}
			}
		}),
		literal<TimelineObjCCGVideo>({
			id: '',
			trigger: { type: Timeline.TriggerType.LOGICAL, value: '1' },
			priority: 0, duration: 0,
			LLayer: CasparLLayer.CasparPlayerClipNextWarning,
			content: {
				type: TimelineContentTypeCasparCg.VIDEO,
				attributes: {
					file: 'assets/no_clip_spinner_loop',
					loop: true
				}
			}
		}),

		literal<TimelineObjCCGHTMLPage>({
			id: '',
			trigger: { type: Timeline.TriggerType.LOGICAL, value: '1' },
			priority: 0, duration: 0,
			LLayer: CasparLLayer.CasparCountdown,
			content: {
				type: TimelineContentTypeCasparCg.HTMLPAGE,
				attributes: {
					url: config.studio.SofieHostURL + '/countdowns/studio0/presenter'
				}
			}
		}),

		..._.range(config.studio.HyperdeckCount).map(i => literal<TimelineObjHyperdeckTransport>({
			id: '',
			trigger: { type: Timeline.TriggerType.LOGICAL, value: '1' },
			priority: 0, duration: 0,
			LLayer: HyperdeckLLayer(i),
			content: {
				type: TimelineContentTypeHyperdeck.TRANSPORT,
				attributes: {
					status: HyperdeckTransportStatus.PREVIEW
				}
			}
		}))

	]
}
