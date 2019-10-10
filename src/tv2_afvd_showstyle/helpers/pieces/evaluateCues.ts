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
import {
	CueDefinitionEkstern,
	CueTime,
	CueType,
	ParseCue,
	UnparsedCue
} from '../../inewsConversion/converters/ParseCue'
import { SourceLayer } from '../../layers'

const FRAME_TIME = 1000 / 25 // TODO: This should be pulled from config.

export function EvaluateCues(
	context: PartContext,
	config: BlueprintConfig,
	pieces: IBlueprintPiece[],
	cues: Array<UnparsedCue | null>,
	partId: string
) {
	cues.forEach(cue => {
		if (cue) {
			const parsedCue = ParseCue(cue)
			switch (
				parsedCue.type // TODO: Break out into individual files
			) {
				case CueType.Ekstern:
					console.log(`CUE: ${JSON.stringify(parsedCue)}`)
					const eksternProps = ((parsedCue as unknown) as CueDefinitionEkstern).source.match(
						/^LIVE (\d+)(?: (spor 2|stereo))?$/i
					)
					console.log(`Props: ${eksternProps}`)
					if (!eksternProps) {
						break
					}
					const source = eksternProps[1]
					const variant = eksternProps[2]
					if (!source) {
						break
					}
					console.log(`Source: ${source}`)
					console.log(`Variant: ${variant}`)
					const sourceInfoCam = FindSourceInfoStrict(
						context,
						config.sources,
						SourceLayerType.REMOTE,
						(parsedCue as any).source
					)
					if (sourceInfoCam === undefined) {
						break
					}
					const atemInput = sourceInfoCam.port
					pieces.push(
						literal<IBlueprintPiece>({
							_id: '',
							externalId: partId,
							name: eksternProps[0],
							enable: {
								start: parsedCue.start ? calculateTime(parsedCue.start) : 0,
								...(parsedCue.end ? { end: calculateTime(parsedCue.end) } : {})
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
										? variant.match(/spor 2/gi)
											? [
													literal<TimelineObjSisyfosMessage>({
														id: '',
														enable: {
															start: 0
														},
														priority: 1,
														layer: SisyfosSourceRemote(source, 'spor 2'),
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
					console.log(`Pieces: ${JSON.stringify(pieces)}`)
					break
				default:
					break
			}
		}
	})
}

function calculateTime(time: CueTime) {
	let result = 0
	if (time.seconds) {
		result += time.seconds * 1000
	}

	if (time.frames) {
		result += time.frames * FRAME_TIME
	}

	return result
}
