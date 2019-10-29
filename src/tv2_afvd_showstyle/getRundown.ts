import * as _ from 'underscore'

import {
	AtemTransitionStyle,
	DeviceType,
	TimelineContentTypeAtem,
	TimelineContentTypeCasparCg,
	TimelineContentTypeHyperdeck,
	TimelineContentTypeSisyfos,
	TimelineObjAtemAUX,
	TimelineObjAtemDSK,
	TimelineObjAtemME,
	TimelineObjAtemSsrc,
	TimelineObjAtemSsrcProps,
	TimelineObjCCGHTMLPage,
	TimelineObjCCGMedia,
	TimelineObjCCGRoute,
	TimelineObjHyperdeckTransport,
	TimelineObjSisyfosMessage,
	Transition,
	TransportStatus,
	TSRTimelineObj,
	TSRTimelineObjBase
} from 'timeline-state-resolver-types'
import {
	BlueprintResultRundown,
	IBlueprintAdLibPiece,
	IBlueprintRundown,
	IBlueprintShowStyleVariant,
	IngestRundown,
	IStudioConfigContext,
	NotesContext,
	PieceLifespan,
	ShowStyleContext,
	SourceLayerType
} from 'tv-automation-sofie-blueprints-integration'
import { literal } from '../common/util'
import { MediaPlayerType } from '../tv2_afvd_studio/config-manifests'
import { SourceInfo } from '../tv2_afvd_studio/helpers/sources'
import {
	AtemLLayer,
	CasparLLayer,
	HyperdeckLLayer,
	SisyfosLLAyer,
	SisyfosSourceCamera,
	SisyfosSourceClip,
	SisyfosSourceRemote
} from '../tv2_afvd_studio/layers'
import { AtemSourceIndex } from '../types/atem'
import { CONSTANTS } from '../types/constants'
import { BlueprintConfig, parseConfig } from './helpers/config'
import { SourceLayer } from './layers'

export function getShowStyleVariantId(
	_context: IStudioConfigContext,
	showStyleVariants: IBlueprintShowStyleVariant[],
	_ingestRundown: IngestRundown
): string | null {
	const variant = _.first(showStyleVariants)
	if (variant) {
		return variant._id
	}
	return null
}

export function getRundown(context: ShowStyleContext, ingestRundown: IngestRundown): BlueprintResultRundown {
	const config = parseConfig(context)

	let startTime: number = 0
	let endTime: number = 0

	// Set start / end times
	if ('payload' in ingestRundown) {
		if (ingestRundown.payload.expectedStart) {
			startTime = Number(ingestRundown.payload.expectedStart)
		}

		if (ingestRundown.payload.expectedEnd) {
			endTime = Number(ingestRundown.payload.expectedEnd)
		}
	}

	// Can't end before we begin
	if (endTime < startTime) {
		endTime = startTime
	}

	return {
		rundown: literal<IBlueprintRundown>({
			externalId: ingestRundown.externalId,
			name: ingestRundown.name,
			expectedStart: startTime,
			expectedDuration: endTime - startTime
		}),
		globalAdLibPieces: getGlobalAdLibPieces(context, config),
		baseline: getBaseline(config)
	}
}

function getGlobalAdLibPieces(_context: NotesContext, config: BlueprintConfig): IBlueprintAdLibPiece[] {
	function makeCameraAdLib(info: SourceInfo, rank: number): IBlueprintAdLibPiece {
		return {
			externalId: 'cam',
			name: info.id + '',
			_rank: rank || 0,
			sourceLayerId: SourceLayer.PgmCam,
			outputLayerId: 'pgm0',
			expectedDuration: 0,
			infiniteMode: PieceLifespan.OutOnNextPart,
			content: {
				timelineObjects: _.compact<TSRTimelineObj>([
					literal<TimelineObjAtemME>({
						id: '',
						enable: { while: '1' },
						priority: 1,
						layer: AtemLLayer.AtemMEProgram,
						content: {
							deviceType: DeviceType.ATEM,
							type: TimelineContentTypeAtem.ME,
							me: {
								input: info.port,
								transition: AtemTransitionStyle.CUT
							}
						}
					}),
					literal<TimelineObjSisyfosMessage>({
						id: '',
						enable: { while: '1' },
						priority: 1,
						layer: SisyfosSourceCamera(info.id),
						content: {
							deviceType: DeviceType.SISYFOS,
							type: TimelineContentTypeSisyfos.SISYFOS,
							isPgm: 1
						}
					})
				])
			}
		}
	}

	const adlibItems: IBlueprintAdLibPiece[] = []
	let cameras = 0
	_.each(config.sources, v => {
		if (v.type === SourceLayerType.CAMERA) {
			adlibItems.push(makeCameraAdLib(v, 100 + cameras))
			cameras++
		}
	})
	adlibItems.push({
		externalId: 'delayed',
		name: `Delayed Playback`,
		_rank: 200,
		sourceLayerId: SourceLayer.PgmCam,
		outputLayerId: 'pgm0',
		expectedDuration: 0,
		infiniteMode: PieceLifespan.OutOnNextPart,
		content: {
			timelineObjects: _.compact<TSRTimelineObj>([
				literal<TimelineObjAtemME>({
					id: '',
					enable: { while: '1' },
					priority: 1,
					layer: AtemLLayer.AtemMEProgram,
					content: {
						deviceType: DeviceType.ATEM,
						type: TimelineContentTypeAtem.ME,
						me: {
							input: 22,
							transition: AtemTransitionStyle.CUT
						}
					}
				})
			])
		}
	})
	adlibItems.push({
		externalId: 'delayedplus',
		name: `Delayed Playback +`,
		_rank: 300,
		sourceLayerId: SourceLayer.PgmCam,
		outputLayerId: 'pgm0',
		expectedDuration: 0,
		infiniteMode: PieceLifespan.OutOnNextPart,
		content: {
			timelineObjects: _.compact<TSRTimelineObj>([
				literal<TimelineObjAtemME>({
					id: '',
					enable: { while: '1' },
					priority: 1,
					layer: AtemLLayer.AtemMEProgram,
					content: {
						deviceType: DeviceType.ATEM,
						type: TimelineContentTypeAtem.ME,
						me: {
							input: 35,
							transition: AtemTransitionStyle.CUT
						}
					}
				})
			])
		}
	})
	return adlibItems
}

function getBaseline(config: BlueprintConfig): TSRTimelineObjBase[] {
	return [
		// Default timeline
		literal<TimelineObjAtemME>({
			id: '',
			enable: { while: '1' },
			priority: 0,
			layer: AtemLLayer.AtemMEProgram,
			content: {
				deviceType: DeviceType.ATEM,
				type: TimelineContentTypeAtem.ME,
				me: {
					input: config.studio.AtemSource.Default,
					transition: AtemTransitionStyle.CUT
				}
			}
		}),
		literal<TimelineObjAtemAUX>({
			id: '',
			enable: { while: '1' },
			priority: 0,
			layer: AtemLLayer.AtemAuxLookahead,
			content: {
				deviceType: DeviceType.ATEM,
				type: TimelineContentTypeAtem.AUX,
				aux: {
					input: config.studio.AtemSource.Default
				}
			}
		}),
		literal<TimelineObjAtemAUX>({
			id: '',
			enable: { while: '1' },
			priority: 0,
			layer: AtemLLayer.AtemAuxSSrc,
			content: {
				deviceType: DeviceType.ATEM,
				type: TimelineContentTypeAtem.AUX,
				aux: {
					input: AtemSourceIndex.SSrc
				}
			}
		}),
		literal<TimelineObjAtemAUX>({
			id: '',
			enable: { while: '1' },
			priority: 0,
			layer: AtemLLayer.AtemAuxClean,
			content: {
				deviceType: DeviceType.ATEM,
				type: TimelineContentTypeAtem.AUX,
				aux: {
					input: AtemSourceIndex.Cfd1
				}
			}
		}),
		literal<TimelineObjAtemDSK>({
			id: '',
			enable: { while: '1' },
			priority: 0,
			layer: AtemLLayer.AtemDSKGraphics,
			content: {
				deviceType: DeviceType.ATEM,
				type: TimelineContentTypeAtem.DSK,
				dsk: {
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
			enable: { while: '1' },
			priority: 0,
			layer: AtemLLayer.AtemDSKEffect,
			content: {
				deviceType: DeviceType.ATEM,
				type: TimelineContentTypeAtem.DSK,
				dsk: {
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
			enable: { while: '1' },
			priority: 0,
			layer: AtemLLayer.AtemSSrcArt,
			content: {
				deviceType: DeviceType.ATEM,
				type: TimelineContentTypeAtem.SSRCPROPS,
				ssrcProps: {
					artFillSource: config.studio.AtemSource.SplitArtF,
					artCutSource: config.studio.AtemSource.SplitArtK,
					artOption: 1, // foreground
					artPreMultiplied: true
				}
			}
		}),
		literal<TimelineObjAtemSsrc>({
			id: '',
			enable: { while: '1' },
			priority: 0,
			layer: AtemLLayer.AtemSSrcDefault,
			content: {
				deviceType: DeviceType.ATEM,
				type: TimelineContentTypeAtem.SSRC,
				ssrc: {
					boxes: [
						{
							// left
							enabled: true,
							source: AtemSourceIndex.Bars,
							size: 580,
							x: -800,
							y: 50,
							cropped: true,
							cropRight: 2000
						},
						{
							// right
							enabled: true,
							source: AtemSourceIndex.Bars,
							size: 580,
							x: 800,
							y: 50
							// note: this sits behind box1, so don't crop it to ensure there is no gap between
						},
						{
							// box 3
							enabled: false
						},
						{
							// box 4
							enabled: false
						}
					]
				}
			}
		}),

		literal<TimelineObjCCGMedia>({
			id: '',
			enable: { while: '1' },
			priority: 0,
			layer: CasparLLayer.CasparPlayerClip,
			content: {
				deviceType: DeviceType.CASPARCG,
				type: TimelineContentTypeCasparCg.MEDIA,
				file: 'EMPTY',
				mixer: {
					opacity: 0
				},
				transitions: {
					inTransition: {
						type: Transition.CUT,
						duration: CONSTANTS.DefaultClipFadeOut
					}
				}
			}
		}),
		literal<TimelineObjCCGRoute>({
			id: '',
			enable: { while: '1' },
			priority: 0,
			layer: CasparLLayer.CasparPlayerClipNext,
			content: {
				deviceType: DeviceType.CASPARCG,
				type: TimelineContentTypeCasparCg.ROUTE,
				mappedLayer: CasparLLayer.CasparPlayerClip,
				mode: 'BACKGROUND'
			}
		}),
		literal<TimelineObjCCGMedia>({
			id: '',
			enable: { while: '1' },
			priority: 0,
			layer: CasparLLayer.CasparPlayerClipNextWarning,
			content: {
				deviceType: DeviceType.CASPARCG,
				type: TimelineContentTypeCasparCg.MEDIA,
				file: 'assets/no_clip_spinner_loop',
				loop: true
			}
		}),

		literal<TimelineObjCCGHTMLPage>({
			id: '',
			enable: { while: '1' },
			priority: 0,
			layer: CasparLLayer.CasparCountdown,
			content: {
				deviceType: DeviceType.CASPARCG,
				type: TimelineContentTypeCasparCg.HTMLPAGE,
				url: config.studio.SofieHostURL + '/countdowns/studio0/presenter'
			}
		}),

		..._.range(config.studio.HyperdeckCount).map(i =>
			literal<TimelineObjHyperdeckTransport>({
				id: '',
				enable: { while: '1' },
				priority: 0,
				layer: HyperdeckLLayer(i),
				content: {
					deviceType: DeviceType.HYPERDECK,
					type: TimelineContentTypeHyperdeck.TRANSPORT,
					status: TransportStatus.PREVIEW
				}
			})
		),

		...config.studio.SourcesCam.split(',').map(props =>
			literal<TimelineObjSisyfosMessage>({
				id: '',
				enable: { while: '1' },
				priority: 0,
				layer: SisyfosSourceCamera(props.split(':')[0]),
				content: {
					deviceType: DeviceType.SISYFOS,
					type: TimelineContentTypeSisyfos.SISYFOS,
					isPgm: 0
				}
			})
		),

		...config.studio.SourcesRM.split(',').map(props =>
			literal<TimelineObjSisyfosMessage>({
				id: '',
				enable: { while: '1' },
				priority: 0,
				layer: SisyfosSourceRemote(props.split(':')[0]),
				content: {
					deviceType: DeviceType.SISYFOS,
					type: TimelineContentTypeSisyfos.SISYFOS,
					isPgm: 0
				}
			})
		),

		...config.studio.SourcesSkype.split(',').map(props =>
			literal<TimelineObjSisyfosMessage>({
				id: '',
				enable: { while: '1' },
				priority: 0,
				layer: SisyfosSourceRemote(`skype_${props.split(':')[0]}`),
				content: {
					deviceType: DeviceType.SISYFOS,
					type: TimelineContentTypeSisyfos.SISYFOS,
					isPgm: 0
				}
			})
		),

		...(config.studio.MediaPlayerType === MediaPlayerType.CasparAB
			? config.studio.ABMediaPlayers.split(',').map(props =>
					literal<TimelineObjSisyfosMessage>({
						id: '',
						enable: { while: '1' },
						priority: 0,
						layer: SisyfosSourceClip(props.split(':')[0]),
						content: {
							deviceType: DeviceType.SISYFOS,
							type: TimelineContentTypeSisyfos.SISYFOS,
							isPgm: 0
						}
					})
			  )
			: [
					literal<TimelineObjSisyfosMessage>({
						id: '',
						enable: { while: '1' },
						priority: 0,
						layer: SisyfosLLAyer.SisyfosSourceClipPending,
						content: {
							deviceType: DeviceType.SISYFOS,
							type: TimelineContentTypeSisyfos.SISYFOS,
							isPgm: 0
						}
					})
			  ])
	]
}
