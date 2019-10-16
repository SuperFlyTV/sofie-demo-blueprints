import {
	AtemTransitionStyle,
	DeviceType,
	TimelineContentTypeAtem,
	TimelineContentTypeCasparCg,
	TimelineObjAtemME,
	TimelineObjAtemSsrc,
	TimelineObjAtemSsrcProps,
	TimelineObjCCGMedia,
	TSRTimelineObj
} from 'timeline-state-resolver-types'
import {
	BasicConfigItemValue,
	IBlueprintPiece,
	PartContext,
	PieceLifespan,
	SourceLayerType,
	SplitsContent,
	TableConfigItemValue
} from 'tv-automation-sofie-blueprints-integration'
import * as _ from 'underscore'
import { literal } from '../../../common/util'
import { BlueprintConfig } from '../../../tv2_afvd_showstyle/helpers/config'
import { SourceLayer } from '../../../tv2_afvd_showstyle/layers'
import { atemNextObject } from '../../../tv2_afvd_studio/helpers/objects'
import { FindSourceInfoStrict, SourceInfo } from '../../../tv2_afvd_studio/helpers/sources'
import { AtemLLayer, CasparLLayer } from '../../../tv2_afvd_studio/layers'
import { AtemSourceIndex } from '../../../types/atem'
import { CueDefinitionDVE } from '../../inewsConversion/converters/ParseCue'
import { GetSisyfosTimelineObjForCamera, GetSisyfosTimelineObjForEkstern } from '../sisyfos/sisyfos'
import { CalculateTime } from './evaluateCues'

interface DVEConfigBox {
	enabled: boolean
	source: number
	x: number
	y: number
	size: number
	cropped: false
	cropTop: number
	cropBottom: number
	cropLeft: number
	cropRight: number
}

interface DVEConfig {
	boxes: {
		[key: number]: DVEConfigBox
	}
	index: number
	properties: {
		artFillSource: number
		artCutSource: number
		artOption: number
		artPreMultiplied: boolean
		artClip: number
		artGain: number
		artInvertKey: boolean
	}
	border: {
		borderEnabled: boolean
		borderBevel: number
		borderOuterWidth: number
		borderInnerWidth: number
		borderOuterSoftness: number
		borderInnerSoftness: number
		borderBevelSoftness: number
		borderBevelPosition: number
		borderHue: number
		borderSaturation: number
		borderLuma: number
		borderLightSourceDirection: number
		borderLightSourceAltitude: number
	}
}

export function EvaluateDVE(
	context: PartContext,
	config: BlueprintConfig,
	pieces: IBlueprintPiece[],
	partId: string,
	parsedCue: CueDefinitionDVE
) {
	if (!parsedCue.template) {
		return
	}

	const rawTemplate = getDVETemplate(config.showStyle.DVEStyles, parsedCue.template) // TODO: pull from config
	if (!rawTemplate) {
		context.warning(`Could not find template ${parsedCue.template}`)
		return
	}
	const background: string = rawTemplate.BackgroundLoop as string

	if (!templateIsValid(JSON.parse(rawTemplate.DVEJSON as string))) {
		context.warning(`Invalid DVE template ${parsedCue.template}`)
		return
	}

	let valid = true

	const boxSources: any[] = []

	// const template: DVEConfig = JSON.parse(rawTemplate.DVEJSON as string) as DVEConfig
	const template: DVEConfig = JSON.parse(rawTemplate.DVEJSON as string) as DVEConfig
	const boxes: DVEConfigBox[] = []
	let audioTimeline: TSRTimelineObj[] = []

	parsedCue.sources.forEach((source, index) => {
		const props = source.split(' ')
		const sourceType = props[0]
		const sourceInput = props[1]
		if (!sourceType || !sourceInput) {
			context.warning(`Invalid DVE source: ${source}`)
			return
		}
		if (sourceType.match(/KAM/i)) {
			const sourceInfoCam = FindSourceInfoStrict(context, config.sources, SourceLayerType.CAMERA, source)
			if (sourceInfoCam === undefined) {
				context.warning(`Invalid source: ${source}`)
				valid = false
				return
			}
			boxSources.push({
				...boxSource(sourceInfoCam, source),
				geometry: makeBox(template.boxes[index])
			})
			boxes.push(template.boxes[index])

			audioTimeline = [...audioTimeline, ...GetSisyfosTimelineObjForCamera(source)]
		} else if (sourceType.match(/LIVE/i) || sourceType.match(/SKYPE/i)) {
			const sourceInfoLive = FindSourceInfoStrict(context, config.sources, SourceLayerType.REMOTE, source)
			if (sourceInfoLive === undefined) {
				context.warning(`Invalid source: ${source}`)
				valid = false
				return
			}
			boxSources.push({
				...boxSource(sourceInfoLive, source),
				geometry: makeBox(template.boxes[index])
			})
			boxes.push(template.boxes[index])

			audioTimeline = [...audioTimeline, ...GetSisyfosTimelineObjForEkstern(source)]
		} else {
			context.warning(`Unknown source type for DVE: ${source}`)
			valid = false
		}
	})

	if (valid) {
		pieces.push(
			literal<IBlueprintPiece>({
				_id: '',
				externalId: partId,
				name: `DVE: ${parsedCue.template}`,
				enable: {
					start: parsedCue.start ? CalculateTime(parsedCue.start) : 0,
					...(parsedCue.end ? { end: CalculateTime(parsedCue.end) } : {})
				},
				outputLayerId: 'pgm0',
				sourceLayerId: SourceLayer.PgmDVE,
				infiniteMode: PieceLifespan.OutOnNextPart,
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

						literal<TimelineObjAtemME>({
							id: '',
							enable: { start: `#${partId}_DVE_ATEMSSRC.start + 80` }, // give the ssrc 2 frames to get configured
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

						...(background
							? [
									literal<TimelineObjCCGMedia>({
										id: '',
										enable: { start: 0 },
										priority: 1,
										layer: CasparLLayer.CasparCGDVELoop,
										content: {
											deviceType: DeviceType.CASPARCG,
											type: TimelineContentTypeCasparCg.MEDIA,
											file: background,
											loop: true
										}
									}),
									literal<TimelineObjAtemSsrcProps>({
										id: '',
										enable: { start: 0 },
										priority: 1,
										layer: AtemLLayer.AtemSSrcArt,
										content: {
											deviceType: DeviceType.ATEM,
											type: TimelineContentTypeAtem.SSRCPROPS,
											ssrcProps: {
												artFillSource: config.studio.AtemSource.SplitArtF,
												artCutSource: config.studio.AtemSource.SplitArtK,
												artOption: 0, // Background
												artPreMultiplied: false
											}
										}
									})
							  ]
							: []),

						// TODO: Graphic overlay

						...audioTimeline,

						atemNextObject(AtemSourceIndex.SSrc)
					])
				})
			})
		)
	}
}

/**
 * Check that a template string is valid.
 * @param template User-provided template.
 */
function templateIsValid(template: any): boolean {
	let boxesValid = false
	let indexValid = false
	let propertiesValid = false
	let borderValid = false
	if (Object.keys(template).indexOf('boxes') !== -1) {
		if (_.isEqual(Object.keys(template.boxes), ['0', '1', '2', '3'])) {
			boxesValid = true
		}
	}

	if (Object.keys(template).indexOf('index') !== -1) {
		indexValid = true
	}

	if (Object.keys(template).indexOf('properties') !== -1) {
		if (
			_.isEqual(Object.keys(template.properties), [
				'artFillSource',
				'artCutSource',
				'artOption',
				'artPreMultiplied',
				'artClip',
				'artGain',
				'artInvertKey'
			])
		) {
			propertiesValid = true
		}
	}

	if (Object.keys(template).indexOf('border') !== -1) {
		if (
			_.isEqual(Object.keys(template.border), [
				'borderEnabled',
				'borderBevel',
				'borderOuterWidth',
				'borderInnerWidth',
				'borderOuterSoftness',
				'borderInnerSoftness',
				'borderBevelSoftness',
				'borderBevelPosition',
				'borderHue',
				'borderSaturation',
				'borderLuma',
				'borderLightSourceDirection',
				'borderLightSourceAltitude'
			])
		) {
			borderValid = true
		}
	}

	if (boxesValid && indexValid && propertiesValid && borderValid) {
		return true
	}
	return false
}

function boxSource(info: SourceInfo, label: string): any {
	return {
		studioLabel: label,
		switcherInput: info.port,
		type: info.type
	}
}

function makeBox(
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
}

function getDVETemplate(
	config: TableConfigItemValue,
	templateName: string
):
	| {
			_id: string
			[key: string]: BasicConfigItemValue
	  }
	| undefined {
	const conf = config.find(c => c.DVEName === templateName)
	return conf
}
