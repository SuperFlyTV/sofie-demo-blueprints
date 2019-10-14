import {
	AtemTransitionStyle,
	DeviceType,
	TimelineContentTypeAtem,
	TimelineContentTypeSisyfos,
	TimelineObjAtemME,
	TimelineObjSisyfosMessage
} from 'timeline-state-resolver-types'
import {
	IBlueprintPiece,
	PartContext,
	PieceLifespan,
	RemoteContent,
	SourceLayerType,
	TimelineObjectCoreExt
} from 'tv-automation-sofie-blueprints-integration'
import { literal } from '../../../common/util'
import { BlueprintConfig } from '../../../tv2_afvd_studio/helpers/config'
import { FindSourceInfoStrict } from '../../../tv2_afvd_studio/helpers/sources'
import { AtemLLayer, SisyfosSourceRemote } from '../../../tv2_afvd_studio/layers'
import { CueDefinitionEkstern } from '../../inewsConversion/converters/ParseCue'
import { SourceLayer } from '../../layers'
import { CalculateTime } from './evaluateCues'

export function EvaluateEkstern(
	context: PartContext,
	config: BlueprintConfig,
	pieces: IBlueprintPiece[],
	partId: string,
	parsedCue: CueDefinitionEkstern
) {
	const eksternProps = parsedCue.source.match(/^LIVE ([^\s]+)(?: (.+))?$/i)
	if (!eksternProps) {
		return
	}
	const source = eksternProps[1]
	const variant = eksternProps[2]
	if (!source) {
		return
	}
	const sourceInfoCam = FindSourceInfoStrict(context, config.sources, SourceLayerType.REMOTE, (parsedCue as any).source)
	if (sourceInfoCam === undefined) {
		return
	}
	const atemInput = sourceInfoCam.port
	pieces.push(
		literal<IBlueprintPiece>({
			_id: '',
			externalId: partId,
			name: eksternProps[0],
			enable: {
				start: parsedCue.start ? CalculateTime(parsedCue.start) : 0,
				...(parsedCue.end ? { end: CalculateTime(parsedCue.end) } : {})
			},
			outputLayerId: 'pgm0',
			sourceLayerId: SourceLayer.PgmLive,
			infiniteMode: PieceLifespan.OutOnNextPart,
			content: literal<RemoteContent>({
				studioLabel: '',
				switcherInput: atemInput,
				timelineObjects: literal<TimelineObjectCoreExt[]>([
					literal<TimelineObjAtemME>({
						id: '',
						enable: {
							start: 0
						},
						priority: 1,
						layer: AtemLLayer.AtemMEProgram,
						content: {
							deviceType: DeviceType.ATEM,
							type: TimelineContentTypeAtem.ME,
							me: {
								input: atemInput,
								transition: AtemTransitionStyle.CUT // TODO: This may change
							}
						}
					}),

					...(variant
						? variant.match(/stereo/gi)
							? [
									literal<TimelineObjSisyfosMessage>({
										id: '',
										enable: {
											start: 0
										},
										priority: 1,
										layer: SisyfosSourceRemote(source, 'stereo_1'),
										content: {
											deviceType: DeviceType.SISYFOS,
											type: TimelineContentTypeSisyfos.SISYFOS,
											isPgm: 1,
											faderLevel: 0.75
										}
									}),
									literal<TimelineObjSisyfosMessage>({
										id: '',
										enable: {
											start: 0
										},
										priority: 1,
										layer: SisyfosSourceRemote(source, 'stereo_2'),
										content: {
											deviceType: DeviceType.SISYFOS,
											type: TimelineContentTypeSisyfos.SISYFOS,
											isPgm: 1,
											faderLevel: 0.75
										}
									})
							  ]
							: [
									literal<TimelineObjSisyfosMessage>({
										id: '',
										enable: {
											start: 0
										},
										priority: 1,
										layer: SisyfosSourceRemote(source, variant),
										content: {
											deviceType: DeviceType.SISYFOS,
											type: TimelineContentTypeSisyfos.SISYFOS,
											isPgm: 1,
											faderLevel: 0.75
										}
									})
							  ]
						: [
								literal<TimelineObjSisyfosMessage>({
									id: '',
									enable: {
										start: 0
									},
									priority: 1,
									layer: SisyfosSourceRemote(source),
									content: {
										deviceType: DeviceType.SISYFOS,
										type: TimelineContentTypeSisyfos.SISYFOS,
										isPgm: 1,
										faderLevel: 0.75
									}
								})
						  ])
				])
			})
		})
	)
}
