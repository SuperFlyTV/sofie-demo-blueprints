import {
	DeviceType,
	TimelineContentTypeVizMSE,
	TimelineObjVIZMSEAny,
	TimelineObjVIZMSEElementInternal
} from 'timeline-state-resolver-types'
import {
	GraphicsContent,
	IBlueprintAdLibPiece,
	IBlueprintPiece,
	PieceLifespan
} from 'tv-automation-sofie-blueprints-integration'
import { literal } from '../../../common/util'
import {
	CueDefinitionGrafik,
	CueDefinitionMOS,
	CueType
} from '../../../tv2_afvd_showstyle/inewsConversion/converters/ParseCue'
import { SourceLayer } from '../../../tv2_afvd_showstyle/layers'
import { VizLLayer } from '../../../tv2_afvd_studio/layers'
import { BlueprintConfig } from '../config'
import { CalculateTime, InfiniteMode } from './evaluateCues'

/**
 * @returns {true} If a cue is a grafik
 */
export function IsGrafik(rawString: string): boolean {
	return !!rawString.match(/^(?:kg |DIGI=)/)
}

export function EvaluateGrafik(
	config: BlueprintConfig,
	pieces: IBlueprintPiece[],
	adlibPieces: IBlueprintAdLibPiece[],
	partId: string,
	parsedCue: CueDefinitionGrafik,
	adlib?: boolean,
	rank?: number
) {
	console.log(`GRAFIK: ${JSON.stringify(parsedCue)}`)
	if (adlib) {
		adlibPieces.push(
			literal<IBlueprintAdLibPiece>({
				_rank: rank || 0,
				externalId: partId,
				name: grafikName(parsedCue),
				sourceLayerId: SourceLayer.PgmGraphics,
				outputLayerId: 'pgm0',
				expectedDuration: getGrafikDuration(config, parsedCue),
				infiniteMode:
					parsedCue.end && parsedCue.end.infiniteMode
						? InfiniteMode(parsedCue.end.infiniteMode, PieceLifespan.Normal)
						: PieceLifespan.Normal,
				content: literal<GraphicsContent>({
					fileName: parsedCue.template,
					path: parsedCue.template,
					timelineObjects: literal<TimelineObjVIZMSEAny[]>([
						literal<TimelineObjVIZMSEElementInternal>({
							id: '',
							enable: {
								start: 0
							},
							priority: 1,
							layer: VizLLayer.VizLLayerOverlay,
							content: {
								deviceType: DeviceType.VIZMSE,
								type: TimelineContentTypeVizMSE.ELEMENT_INTERNAL,
								templateName: getTemplateName(config, parsedCue),
								templateData: parsedCue.textFields
							}
						})
					])
				})
			})
		)
	} else {
		pieces.push(
			literal<IBlueprintPiece>({
				_id: '',
				externalId: partId,
				name: grafikName(parsedCue),
				enable: {
					start: 0
				},
				outputLayerId: 'pgm0',
				sourceLayerId: SourceLayer.PgmGraphics,
				infiniteMode:
					parsedCue.end && parsedCue.end.infiniteMode
						? InfiniteMode(parsedCue.end.infiniteMode, PieceLifespan.Normal)
						: PieceLifespan.Normal,
				content: literal<GraphicsContent>({
					fileName: parsedCue.template,
					path: parsedCue.template,
					timelineObjects: literal<TimelineObjVIZMSEAny[]>([
						literal<TimelineObjVIZMSEElementInternal>({
							id: '',
							enable: {
								start: parsedCue.start ? CalculateTime(parsedCue.start) : 0
							},
							priority: 1,
							layer: VizLLayer.VizLLayerOverlay,
							content: {
								deviceType: DeviceType.VIZMSE,
								type: TimelineContentTypeVizMSE.ELEMENT_INTERNAL,
								templateName: getTemplateName(config, parsedCue),
								templateData: parsedCue.textFields
							}
						})
					])
				})
			})
		)
	}
}

export function grafikName(parsedCue: CueDefinitionGrafik | CueDefinitionMOS): string {
	if (parsedCue.type === CueType.Grafik) {
		return `${parsedCue.template ? `${parsedCue.template}` : ''}${parsedCue.textFields
			.filter(txt => !txt.match(/^;.\.../))
			.map(txt => ` - ${txt}`)}`.replace(/,/g, '')
	} else {
		return `${parsedCue.name ? parsedCue.name : ''}${parsedCue.vcpid ? parsedCue.vcpid : parsedCue.vcpid}`
	}
}

function createTimingGrafik(config: BlueprintConfig, cue: CueDefinitionGrafik): { start: number; end: number } {
	const ret: { start: number; end: number } = { start: 0, end: 0 }
	cue.start ? (ret.start = CalculateTime(cue.start)) : (ret.start = 0)

	cue.end ? (ret.end = CalculateTime(cue.end)) : (ret.end = getGrafikDuration(config, cue))

	return ret
}

function getGrafikDuration(config: BlueprintConfig, cue: CueDefinitionGrafik): number {
	const template = config.showStyle.GFXTemplates.find(templ => templ.iNewsName === cue.template)
	if (template) {
		if (template.OutType && !template.OutType.toString().match(/default/i)) {
			return 0
		}
	}

	return config.showStyle.DefaultTemplateDuration !== undefined
		? Number(config.showStyle.DefaultTemplateDuration) * 1000
		: 4000
}

function getTemplateName(config: BlueprintConfig, cue: CueDefinitionGrafik): string {
	const template = config.showStyle.GFXTemplates.find(templ => templ.iNewsName === cue.template)
	if (template) {
		return template.VizTemplate.toString()
	}

	// This means unconfigured templates will still be supported, with default out.
	return cue.template
}
