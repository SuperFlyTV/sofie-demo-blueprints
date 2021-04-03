import { SourceLayerType, SplitsContent, SplitsContentBoxContent, SplitsContentBoxProperties, TSR } from "@sofie-automation/blueprints-integration"
import { AtemSourceType, StudioConfig } from "../../studio0/helpers/config"
import { literal } from "../../common/util"
import { DVEProps } from "../definitions"
import { getClipPlayerInput } from "./clips"
import { getSourceInfoFromRaw } from "./sources"

export type DVELayout = TSR.SuperSourceBox[]

export enum DVELayouts {
    TwoBox
}

export const DVEDesigns: Record<DVELayouts, DVELayout> = {
    [DVELayouts.TwoBox]: [ 
        {
            enabled: true,
            source: 0,
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
            source: 0,
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
    ]
}

export function dveLayoutToContent(
    config: StudioConfig,
	ssrcLayout: TSR.TimelineObjAtemSsrc['content']['ssrc'],
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
			studioLabel: 'fileName' in info ? info.fileName : `${info.type} ${info.id + 1}`,
			switcherInput: 'fileName' in info ? getClipPlayerInput(config)?.input || 0 : getSourceInfoFromRaw(config, info).input,
			type: 'fileName' in info ? SourceLayerType.VT : info.type === AtemSourceType.Remote ? SourceLayerType.REMOTE : SourceLayerType.CAMERA,
			geometry,
		})
	}

	return {
		boxSourceConfiguration: allBoxes.map((b, i) => boxSource(b, ssrcLayout.boxes[i])),
	}
}
