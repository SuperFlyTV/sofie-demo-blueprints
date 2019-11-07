import {
	AtemTransitionStyle,
	DeviceType,
	TimelineContentTypeAtem,
	TimelineContentTypeCasparCg,
	TimelineObjAtemME,
	TimelineObjAtemSsrc,
	TimelineObjAtemSsrcProps,
	TimelineObjCCGMedia,
	TimelineObjCCGTemplate,
	TSRTimelineObj
} from 'timeline-state-resolver-types'
import {
	CameraContent,
	GraphicsContent,
	PartContext,
	RemoteContent,
	SourceLayerType,
	SplitsContent,
	VTContent
} from 'tv-automation-sofie-blueprints-integration'
import * as _ from 'underscore'
import { literal } from '../../../common/util'
import { BlueprintConfig } from '../../../tv2_afvd_showstyle/helpers/config'
import { atemNextObject } from '../../../tv2_afvd_studio/helpers/objects'
import { FindSourceInfoStrict, SourceInfo } from '../../../tv2_afvd_studio/helpers/sources'
import { AtemLLayer, CasparLLayer } from '../../../tv2_afvd_studio/layers'
import { AtemSourceIndex } from '../../../types/atem'
import { CueDefinitionDVE, DVESources } from '../../inewsConversion/converters/ParseCue'
import { DVEConfig, DVEConfigBox } from '../pieces/dve'
import { GetSisyfosTimelineObjForCamera, GetSisyfosTimelineObjForEkstern } from '../sisyfos/sisyfos'

export function MakeContentDVE(
	context: PartContext,
	config: BlueprintConfig,
	partId: string,
	parsedCue: CueDefinitionDVE,
	template: DVEConfig
): { content: SplitsContent; valid: boolean } {
	const boxes: DVEConfigBox[] = []
	let audioTimeline: TSRTimelineObj[] = []
	const boxSources: Array<
		(VTContent | CameraContent | RemoteContent | GraphicsContent) & {
			type: SourceLayerType
			studioLabel: string
			switcherInput: number | string
			/** Geometry information for a given box item in the Split. X,Y are relative to center of Box, Scale is 0...1, where 1 is Full-Screen */
			geometry?: {
				x: number
				y: number
				scale: number
				crop?: {
					left: number
					top: number
					right: number
					bottom: number
				}
			}
		}
	> = []

	let valid = true

	const dveConfig = config.showStyle.DVEStyles
		? config.showStyle.DVEStyles.find(conf => conf.DVEName === parsedCue.template)
		: undefined

	if (!dveConfig) {
		context.warning(`DVE ${parsedCue.template} is not configured`)
		return {
			valid: false,
			content: {
				boxSourceConfiguration: [],
				timelineObjects: [],
				dveConfiguration: []
			}
		}
	}

	const inputs = dveConfig.DVEInputs
		? dveConfig.DVEInputs.toString().split(';')
		: '1:INP1;2:INP2;3:INP3;4:INP4'.split(';')
	const boxMap: [string, string, string, string] = ['', '', '', '']

	inputs.forEach(source => {
		const sourceProps = source.split(':')
		const mappingFrom = sourceProps[1]
		const mappingTo = Number(sourceProps[0])
		if (!mappingFrom || !mappingTo || isNaN(mappingTo)) {
			context.warning(`Invalid DVE mapping: ${sourceProps}`)
			return
		}

		const prop = parsedCue.sources[mappingFrom as keyof DVESources]
		if (!prop) {
			context.warning(`Missing mapping for ${mappingTo}`)
			return
		}
		boxMap[mappingTo - 1] = prop
	})

	boxMap.forEach((mappingFrom, num) => {
		if (mappingFrom === undefined || mappingFrom === '') {
			boxSources.push({
				...{
					studioLabel: '',
					switcherInput: 0,
					type: SourceLayerType.CAMERA
				},
				...literal<CameraContent>({
					studioLabel: '',
					switcherInput: 0,
					timelineObjects: []
				})
			})
			boxes.push({ ...template.boxes[num], ...{ source: 0, enabled: false } })
		} else {
			const props = mappingFrom.split(' ')
			const sourceType = props[0]
			const sourceInput = props[1]
			if (!sourceType || !sourceInput) {
				context.warning(`Invalid DVE source: ${mappingFrom}`)
				return
			}
			if (sourceType.match(/KAM/i)) {
				const sourceInfoCam = FindSourceInfoStrict(context, config.sources, SourceLayerType.CAMERA, mappingFrom)
				if (sourceInfoCam === undefined) {
					context.warning(`Invalid source: ${mappingFrom}`)
					valid = false
					return
				}
				boxSources.push({
					...boxSource(sourceInfoCam, mappingFrom),
					...literal<CameraContent>({
						studioLabel: '',
						switcherInput: Number(sourceInfoCam.port),
						timelineObjects: []
					})
				})
				boxes.push({ ...template.boxes[num], ...{ source: Number(sourceInfoCam.port), enabled: true } })

				audioTimeline = [...audioTimeline, ...GetSisyfosTimelineObjForCamera(mappingFrom, false)]
			} else if (sourceType.match(/LIVE/i) || sourceType.match(/SKYPE/i)) {
				const sourceInfoLive = FindSourceInfoStrict(context, config.sources, SourceLayerType.REMOTE, mappingFrom)
				if (sourceInfoLive === undefined) {
					context.warning(`Invalid source: ${mappingFrom}`)
					valid = false
					return
				}
				boxSources.push({
					...boxSource(sourceInfoLive, mappingFrom),
					...literal<RemoteContent>({
						studioLabel: '',
						switcherInput: Number(sourceInfoLive.port),
						timelineObjects: []
					})
				})
				boxes.push({ ...template.boxes[num], ...{ source: Number(sourceInfoLive.port), enabled: true } })

				audioTimeline = [...audioTimeline, ...GetSisyfosTimelineObjForEkstern(mappingFrom, false)]
			} else {
				context.warning(`Unknown source type for DVE: ${mappingFrom}`)
				valid = false
			}
		}
	})

	const graphicsTemplateName = dveConfig.DVEGraphicsTemplate ? dveConfig.DVEGraphicsTemplate.toString() : ''
	const graphicsTemplateStyle = dveConfig.DVEGraphicsTemplateJSON
		? JSON.parse(dveConfig.DVEGraphicsTemplateJSON.toString())
		: ''
	const graphicsTemplateContent: { [key: string]: string } = {}
	const keyFile = dveConfig.DVEGraphicsKey ? dveConfig.DVEGraphicsKey.toString() : ''
	const frameFile = dveConfig.DVEGraphicsFrame ? dveConfig.DVEGraphicsFrame.toString() : ''

	parsedCue.labels.forEach((label, i) => {
		graphicsTemplateContent[`locator${i + 1}`] = label
	})

	return {
		valid,
		content: literal<SplitsContent>({
			boxSourceConfiguration: boxSources,
			dveConfiguration: {},
			timelineObjects: _.compact<TSRTimelineObj>([
				// setup ssrc
				literal<TimelineObjAtemSsrc>({
					id: `${partId}_DVE_ATEMSSRC`,
					enable: { start: 0 },
					priority: 1,
					layer: AtemLLayer.AtemSSrcDefault,
					content: {
						deviceType: DeviceType.ATEM,
						type: TimelineContentTypeAtem.SSRC,
						ssrc: { boxes }
					}
				}),
				literal<TimelineObjAtemSsrcProps>({
					id: `${partId}_DVE_ATEMSSRC_ART`,
					enable: { start: 10 },
					priority: 1,
					layer: AtemLLayer.AtemSSrcArt,
					content: {
						deviceType: DeviceType.ATEM,
						type: TimelineContentTypeAtem.SSRCPROPS,
						ssrcProps: {
							artFillSource: config.studio.AtemSource.SplitArtF,
							artCutSource: config.studio.AtemSource.SplitArtK,
							artOption: 1,
							artPreMultiplied: true
						}
					}
				}),

				literal<TimelineObjAtemME>({
					id: '',
					enable: { start: 80 }, // give the ssrc 2 frames to get configured
					priority: 1,
					layer: AtemLLayer.AtemMEProgram,
					content: {
						deviceType: DeviceType.ATEM,
						type: TimelineContentTypeAtem.ME,
						me: {
							input: AtemSourceIndex.SSrc,
							transition: AtemTransitionStyle.CUT
						}
					}
				}),
				...(graphicsTemplateName
					? [
							literal<TimelineObjCCGTemplate>({
								id: '',
								enable: { start: 0 },
								priority: 1,
								layer: CasparLLayer.CasparCGDVETemplate,
								content: {
									deviceType: DeviceType.CASPARCG,
									type: TimelineContentTypeCasparCg.TEMPLATE,
									templateType: 'html',
									name: graphicsTemplateName,
									data: {
										display: {
											isPreview: false,
											displayState: 'locators'
										},
										locators: {
											style: graphicsTemplateStyle ? graphicsTemplateStyle : {},
											content: graphicsTemplateContent
										}
									},
									useStopCommand: false
								}
							})
					  ]
					: []),
				...(keyFile
					? [
							literal<TimelineObjCCGMedia>({
								id: '',
								enable: { start: 0 },
								priority: 1,
								layer: CasparLLayer.CasparCGDVEKey,
								content: {
									deviceType: DeviceType.CASPARCG,
									type: TimelineContentTypeCasparCg.MEDIA,
									file: keyFile,
									mixer: {
										keyer: true
									},
									loop: true
								}
							})
					  ]
					: []),
				...(frameFile
					? [
							literal<TimelineObjCCGMedia>({
								id: '',
								enable: { start: 0 },
								priority: 1,
								layer: CasparLLayer.CasparCGDVEFrame,
								content: {
									deviceType: DeviceType.CASPARCG,
									type: TimelineContentTypeCasparCg.MEDIA,
									file: frameFile,
									loop: true
								}
							})
					  ]
					: []),

				...audioTimeline,

				atemNextObject(AtemSourceIndex.SSrc)
			])
		})
	}
}

function boxSource(
	info: SourceInfo,
	label: string
): {
	studioLabel: string
	switcherInput: number
	type: SourceLayerType.CAMERA | SourceLayerType.REMOTE | SourceLayerType.AUDIO
} {
	return {
		studioLabel: label,
		switcherInput: info.port,
		type: info.type
	}
}

/*function makeBox(
	configBox: DVEConfigBox
): {
	x: number
	y: number
	scale: number
	crop?: {
		left: number
		top: number
		right: number
		bottom: number
	}
} {
	return {
		x: configBox.x,
		y: configBox.y,
		scale: configBox.size / 1000,
		...(configBox.cropped
			? {
					crop: {
						left: configBox.cropLeft,
						top: configBox.cropTop,
						right: configBox.cropRight,
						bottom: configBox.cropBottom
					}
			  }
			: {})
	}
}*/
