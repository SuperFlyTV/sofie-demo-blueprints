import {
	IBlueprintPiece,
	PartContext,
	PieceLifespan,
	SourceLayerType,
	SplitsContent
} from 'tv-automation-sofie-blueprints-integration'
import * as _ from 'underscore'
import { literal } from '../../../common/util'
import { SourceLayer } from '../../../tv2_afvd_showstyle/layers'
import { BlueprintConfig } from '../../../tv2_afvd_studio/helpers/config'
import { FindSourceInfoStrict, SourceInfo } from '../../../tv2_afvd_studio/helpers/sources'
import { CueDefinitionDVE } from '../../inewsConversion/converters/ParseCue'
import { CalculateTime } from './evaluateCues'
// import { TSRTimelineObj } from 'timeline-state-resolver-types'

// {"boxes":{"0":{"enabled":true,"source":0,"x":0,"y":450,"size":500,"cropped":false,"cropTop":0,"cropBottom":0,"cropLeft":0,"cropRight":0},"1":{"enabled":true,"source":0,"x":50,"y":580,"size":256,"cropped":false,"cropTop":0,"cropBottom":0,"cropLeft":0,"cropRight":0},"2":{"enabled":true,"source":0,"x":-800,"y":-450,"size":500,"cropped":false,"cropTop":0,"cropBottom":0,"cropLeft":0,"cropRight":0},"3":{"enabled":true,"source":0,"x":800,"y":-450,"size":500,"cropped":false,"cropTop":0,"cropBottom":0,"cropLeft":0,"cropRight":0}},"index":0,"properties":{"artFillSource":3010,"artCutSource":3011,"artOption":0,"artPreMultiplied":false,"artClip":500,"artGain":700,"artInvertKey":false},"border":{"borderEnabled":false,"borderBevel":1,"borderOuterWidth":50,"borderInnerWidth":50,"borderOuterSoftness":0,"borderInnerSoftness":0,"borderBevelSoftness":0,"borderBevelPosition":50,"borderHue":0,"borderSaturation":0,"borderLuma":1000,"borderLightSourceDirection":360,"borderLightSourceAltitude":25}}

/*interface DVEConfigBox {
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
		0: DVEConfigBox
		1: DVEConfigBox
		2: DVEConfigBox
		3: DVEConfigBox
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
}*/

const exampleJSON = {
	boxes: {
		'0': {
			enabled: true,
			source: 0,
			x: 0,
			y: 450,
			size: 500,
			cropped: false,
			cropTop: 0,
			cropBottom: 0,
			cropLeft: 0,
			cropRight: 0
		},
		'1': {
			enabled: true,
			source: 0,
			x: 50,
			y: 580,
			size: 256,
			cropped: false,
			cropTop: 0,
			cropBottom: 0,
			cropLeft: 0,
			cropRight: 0
		},
		'2': {
			enabled: true,
			source: 0,
			x: -800,
			y: -450,
			size: 500,
			cropped: false,
			cropTop: 0,
			cropBottom: 0,
			cropLeft: 0,
			cropRight: 0
		},
		'3': {
			enabled: true,
			source: 0,
			x: 800,
			y: -450,
			size: 500,
			cropped: false,
			cropTop: 0,
			cropBottom: 0,
			cropLeft: 0,
			cropRight: 0
		}
	},
	index: 0,
	properties: {
		artFillSource: 3010,
		artCutSource: 3011,
		artOption: 0,
		artPreMultiplied: false,
		artClip: 500,
		artGain: 700,
		artInvertKey: false
	},
	border: {
		borderEnabled: false,
		borderBevel: 1,
		borderOuterWidth: 50,
		borderInnerWidth: 50,
		borderOuterSoftness: 0,
		borderInnerSoftness: 0,
		borderBevelSoftness: 0,
		borderBevelPosition: 50,
		borderHue: 0,
		borderSaturation: 0,
		borderLuma: 1000,
		borderLightSourceDirection: 360,
		borderLightSourceAltitude: 25
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

	const rawTemplate = exampleJSON // TODO: pull from config

	if (!templateIsValid(rawTemplate)) {
		context.warning(`Invalid DVE template ${'EXAMPLE DVE'}`)
		return
	}

	let valid = true

	const boxSources: any[] = []

	function boxSource(info: SourceInfo, label: string): any {
		return {
			studioLabel: label,
			switcherInput: info.port,
			type: info.type
		}
	}

	parsedCue.sources.forEach(source => {
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
			boxSources.push(boxSource(sourceInfoCam, source))
		} else if (sourceType.match(/LIVE/i)) {
			const sourceInfoLive = FindSourceInfoStrict(context, config.sources, SourceLayerType.REMOTE, source)
			if (sourceInfoLive === undefined) {
				context.warning(`Invalid source: ${source}`)
				valid = false
				return
			}
			boxSources.push(boxSource(sourceInfoLive, source))
		} else {
			context.warning(`Unknown source type: ${source}`)
		}
	})

	/*const template: DVEConfig = rawTemplate as DVEConfig*/

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
					// timelineObjects: literal<TSRTimelineObj>([])
					timelineObjects: []
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
