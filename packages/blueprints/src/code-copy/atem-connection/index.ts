// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Enum {
	export enum SuperSourceArtOption {
		Background,
		Foreground,
	}

	export enum BorderBevel {
		None = 0,
		InOut = 1,
		In = 2,
		Out = 3,
	}
}

export interface SuperSourceBox {
	enabled: boolean
	source: number
	x: number
	y: number
	size: number
	cropped: boolean
	cropTop: number
	cropBottom: number
	cropLeft: number
	cropRight: number
}

export interface SuperSourceProperties {
	artFillSource: number
	artCutSource: number
	artOption: Enum.SuperSourceArtOption
	artPreMultiplied: boolean
	artClip: number
	artGain: number
	artInvertKey: boolean
}

export interface SuperSourceBorder {
	borderEnabled: boolean
	borderBevel: Enum.BorderBevel
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

export interface SuperSource {
	readonly index: number
	readonly boxes: [
		SuperSourceBox | undefined,
		SuperSourceBox | undefined,
		SuperSourceBox | undefined,
		SuperSourceBox | undefined,
	]
	properties?: SuperSourceProperties
	border?: SuperSourceBorder
}
