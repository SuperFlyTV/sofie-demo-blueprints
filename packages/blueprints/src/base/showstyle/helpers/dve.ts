import {
	IShowStyleContext,
	SourceLayerType,
	SplitsContent,
	SplitsContentBoxContent,
	SplitsContentBoxProperties,
	TSR,
} from '@sofie-automation/blueprints-integration'
import { literal } from '../../../common/util.js'
import { SourceType, StudioConfig } from '../../studio/helpers/config.js'
import { DVEProps } from '../definitions/index.js'
import { getClipPlayerInput } from './clips.js'
import { parseConfig } from './config.js'
import { getSourceInfoFromRaw } from './sources.js'

export type DVELayout = TSR.SuperSourceBox[]

export enum DVELayouts {
	TwoBox,
}

export const DVEDesigns: Record<DVELayouts, DVELayout> = {
	[DVELayouts.TwoBox]: [
		{
			enabled: true,
			source: 1000, // bars
			size: 580,
			x: -800,
			y: 50,
			cropped: true,
			cropLeft: 0,
			cropTop: 0,
			cropRight: 2000,
			cropBottom: 0,
		},
		{
			enabled: true,
			source: 1000,
			size: 580,
			x: 800,
			y: 50,
			// note: this sits behind box1, so don't crop it to ensure there is no gap between
		},
		{
			enabled: false,
		},
		{
			enabled: false,
		},
	],
}

export function parseSuperSourceProps(
	context: IShowStyleContext,
	partProps: DVEProps
): TSR.TimelineContentAtemSsrcProps['ssrcProps'] {
	const config = parseConfig(context)
	const layoutName = partProps.layout || config.dvePresets[0].name
	const layout = config.dvePresets.find((p) => p.name === layoutName)

	return literal<TSR.TimelineContentAtemSsrcProps['ssrcProps']>({
		artFillSource: layout?.preset.properties?.artFillSource || 0,
		artCutSource: layout?.preset.properties?.artCutSource || 0,
		artOption: layout?.preset.properties?.artOption || 0,
		...(layout?.preset.properties?.artPreMultiplied === false
			? {
					artPreMultiplied: false,
					artInvertKey: layout?.preset.properties.artInvertKey,
					artClip: layout?.preset.properties.artClip * 10,
					artGain: layout?.preset.properties.artGain * 10,
				}
			: { artPreMultiplied: true }),
		...(layout?.preset.border?.borderEnabled
			? {
					...layout?.preset.border,
				}
			: { borderEnabled: false }),
	})
}

export function parseSuperSourceLayout(context: IShowStyleContext, partProps: DVEProps): TSR.SuperSourceBox[] {
	const config = parseConfig(context)
	const layoutName = partProps.layout || config.dvePresets[0].name
	const layout = config.dvePresets.find((p) => p.name === layoutName) || config.dvePresets[0]

	return layout?.preset.boxes.map((b) => literal<TSR.SuperSourceBox>({ ...b, source: 0 })).slice(0, layout.boxes) || []
}

export function dveLayoutToContent(
	config: StudioConfig,
	ssrcLayout: TSR.TimelineContentAtemSsrc['ssrc'],
	allBoxes: DVEProps['inputs']
): Pick<SplitsContent, 'boxSourceConfiguration'> {
	function boxSource(
		info: DVEProps['inputs'][any],
		atemBox: TSR.SuperSourceBox | undefined
	): SplitsContentBoxContent & SplitsContentBoxProperties {
		const geometry = atemBox
			? literal<SplitsContentBoxProperties['geometry']>({
					x: (atemBox.x || 0) / 3200 + 0.5,
					y: 0.5 - (atemBox.y || 0) / 1800,
					scale: (atemBox.size || 0) / 1000,
					crop: atemBox.cropped
						? {
								left: (atemBox.cropLeft || 0) / 32000,
								right: (atemBox.cropRight || 0) / 32000,
								top: (atemBox.cropTop || 0) / 18000,
								bottom: (atemBox.cropBottom || 0) / 18000,
							}
						: undefined,
				})
			: undefined

		return literal<SplitsContentBoxContent & SplitsContentBoxProperties>({
			studioLabel: 'fileName' in info ? info.fileName : `${info.type} ${info.id}`,
			switcherInput:
				'fileName' in info ? getClipPlayerInput(config)?.input || 0 : getSourceInfoFromRaw(config, info).input,
			type:
				'fileName' in info
					? SourceLayerType.VT
					: info.type === SourceType.Remote
						? SourceLayerType.REMOTE
						: SourceLayerType.CAMERA,
			geometry,
		})
	}

	return {
		boxSourceConfiguration: allBoxes.map((b, i) => boxSource(b, ssrcLayout.boxes[i])),
	}
}
