import {
	BasicConfigItemValue,
	IBlueprintPiece,
	PartContext,
	PieceLifespan,
	TableConfigItemValue
} from 'tv-automation-sofie-blueprints-integration'
import * as _ from 'underscore'
import { literal } from '../../../common/util'
import { BlueprintConfig } from '../../../tv2_afvd_showstyle/helpers/config'
import { SourceLayer } from '../../../tv2_afvd_showstyle/layers'
import { CueDefinitionDVE } from '../../inewsConversion/converters/ParseCue'
import { MakeContentDVE } from '../content/dve'
import { CalculateTime } from './evaluateCues'

export interface DVEConfigBox {
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

export interface DVEConfig {
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

	const rawTemplate = GetDVETemplate(config.showStyle.DVEStyles, parsedCue.template)
	if (!rawTemplate) {
		context.warning(`Could not find template ${parsedCue.template}`)
		return
	}
	// @todo: To be pulled from a story cue
	// const background: string = rawTemplate.BackgroundLoop as string
	const background = 'amb' // @todo: hardcode!

	if (!TemplateIsValid(JSON.parse(rawTemplate.DVEJSON as string))) {
		context.warning(`Invalid DVE template ${parsedCue.template}`)
		return
	}

	// const template: DVEConfig = JSON.parse(rawTemplate.DVEJSON as string) as DVEConfig
	const template: DVEConfig = JSON.parse(rawTemplate.DVEJSON as string) as DVEConfig

	const content = MakeContentDVE(context, config, partId, parsedCue, template, background)

	if (content.valid) {
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
				content: content.content
			})
		)
	}
}

/**
 * Check that a template string is valid.
 * @param template User-provided template.
 */
export function TemplateIsValid(template: any): boolean {
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

export interface DVEConfigInput {
	_id: string
	DVEName: string
	DVEJSON: string
	DVEGraphicsTemplate: string
	DVEGraphicsTemplateJSON: string
	DVEInputs: string
	[key: string]: BasicConfigItemValue
}

export function GetDVETemplate(config: TableConfigItemValue, templateName: string): DVEConfigInput | undefined {
	const conf = config.find(c => c.DVEName === templateName)
	return conf as DVEConfigInput
}
