import { ConfigItemValue } from 'tv-automation-sofie-blueprints-integration'
import { MediaPlayerType } from '../../tv2_afvd_studio/config-manifests'

export interface ConfigMap {
	[key: string]: ConfigItemValue
}

// in here will be some mock configs that can be referenced paired with ro's for the tests
export const defaultStudioConfig: ConfigMap = {
	MediaPlayerType: MediaPlayerType.CasparWithNext,
	SourcesCam:
		'1:1,2:2,3:3,4:4,5:5,1S:6,2S:7,3S:8,4S:9,5S:10,X8:13,HVID:14,AR:16,CS1:17,CS2:18,CS3:19,CS4:20,CS5:21,CS 1:17,CS 2:18,CS 3:19,CS 4:20,CS 5:21,SORT:22,11:11,12:12,13:13,14:14,15:15',
	SourcesSkype: '1:1,2:2,3:3,4:4,5:5,6:6,7:7',
	SourcesRM: '1:1,2:2,3:3,4:4,5:5,6:6,7:7,8:8,9:9,10:10'
}

export const casparABPlaybackConfig: ConfigMap = {
	...defaultStudioConfig,
	CONFIG_ID: 'CasparAB',
	MediaPlayerType: MediaPlayerType.CasparAB
}

export const defaultShowStyleConfig: ConfigMap = {
	DefaultTemplateDuration: 4,
	JingleTimings: 'SN_intro_19:50',
	DVEStyles: [
		{
			_id: '',
			DVEName: 'morbarn',
			BackgroundLoop: 'loopy',
			DVEInputs: '3:INP1;4:INP2',
			DVEJSON:
				'{"boxes":{"0":{"enabled":true,"source":0,"x":0,"y":450,"size":500,"cropped":false,"cropTop":0,"cropBottom":0,"cropLeft":0,"cropRight":0},"1":{"enabled":true,"source":0,"x":50,"y":580,"size":256,"cropped":false,"cropTop":0,"cropBottom":0,"cropLeft":0,"cropRight":0},"2":{"enabled":true,"source":0,"x":-800,"y":-450,"size":500,"cropped":false,"cropTop":0,"cropBottom":0,"cropLeft":0,"cropRight":0},"3":{"enabled":true,"source":0,"x":800,"y":-450,"size":500,"cropped":false,"cropTop":0,"cropBottom":0,"cropLeft":0,"cropRight":0}},"index":0,"properties":{"artFillSource":3010,"artCutSource":3011,"artOption":0,"artPreMultiplied":false,"artClip":500,"artGain":700,"artInvertKey":false},"border":{"borderEnabled":false,"borderBevel":1,"borderOuterWidth":50,"borderInnerWidth":50,"borderOuterSoftness":0,"borderInnerSoftness":0,"borderBevelSoftness":0,"borderBevelPosition":50,"borderHue":0,"borderSaturation":0,"borderLuma":1000,"borderLightSourceDirection":360,"borderLightSourceAltitude":25}}',
			DVEGraphicsTemplate: 'dve/locators',
			DVEGraphicsTemplateJSON:
				'{"locator1": {"heigt": 30, "widht": 300, "x":100,"y":100},"locator2": {"heigt": 30, "widht": 300, "x":500,"y":100}}',
			DVEGraphicsKey: 'loopy_key',
			DVEGraphicsFrame: 'loopy_frame'
		},
		{
			_id: '',
			DVEName: '1til2',
			BackgroundLoop: 'loopy',
			DVEInputs: '2:INP1;1:INP2',
			DVEJSON:
				'{"boxes":{"0":{"enabled":true,"source":0,"x":0,"y":450,"size":500,"cropped":false,"cropTop":0,"cropBottom":0,"cropLeft":0,"cropRight":0},"1":{"enabled":true,"source":0,"x":50,"y":580,"size":256,"cropped":false,"cropTop":0,"cropBottom":0,"cropLeft":0,"cropRight":0},"2":{"enabled":true,"source":0,"x":-800,"y":-450,"size":500,"cropped":false,"cropTop":0,"cropBottom":0,"cropLeft":0,"cropRight":0},"3":{"enabled":true,"source":0,"x":800,"y":-450,"size":500,"cropped":false,"cropTop":0,"cropBottom":0,"cropLeft":0,"cropRight":0}},"index":0,"properties":{"artFillSource":3010,"artCutSource":3011,"artOption":0,"artPreMultiplied":false,"artClip":500,"artGain":700,"artInvertKey":false},"border":{"borderEnabled":false,"borderBevel":1,"borderOuterWidth":50,"borderInnerWidth":50,"borderOuterSoftness":0,"borderInnerSoftness":0,"borderBevelSoftness":0,"borderBevelPosition":50,"borderHue":0,"borderSaturation":0,"borderLuma":1000,"borderLightSourceDirection":360,"borderLightSourceAltitude":25}}',
			DVEGraphicsTemplate: 'dve/locators',
			DVEGraphicsTemplateJSON:
				'{"locator1": {"heigt": 30, "widht": 300, "x":100,"y":100},"locator2": {"heigt": 30, "widht": 300, "x":500,"y":100}}',
			DVEGraphicsKey: 'loopy_key',
			DVEGraphicsFrame: 'loopy_frame'
		},
		{
			_id: '',
			DVEName: 'Teaserboks Aktiver foerst',
			BackgroundLoop: 'loopy',
			DVEJSON:
				'{"boxes":{"0":{"enabled":true,"source":0,"x":0,"y":450,"size":500,"cropped":false,"cropTop":0,"cropBottom":0,"cropLeft":0,"cropRight":0},"1":{"enabled":true,"source":0,"x":50,"y":580,"size":256,"cropped":false,"cropTop":0,"cropBottom":0,"cropLeft":0,"cropRight":0},"2":{"enabled":true,"source":0,"x":-800,"y":-450,"size":500,"cropped":false,"cropTop":0,"cropBottom":0,"cropLeft":0,"cropRight":0},"3":{"enabled":true,"source":0,"x":800,"y":-450,"size":500,"cropped":false,"cropTop":0,"cropBottom":0,"cropLeft":0,"cropRight":0}},"index":0,"properties":{"artFillSource":3010,"artCutSource":3011,"artOption":0,"artPreMultiplied":false,"artClip":500,"artGain":700,"artInvertKey":false},"border":{"borderEnabled":false,"borderBevel":1,"borderOuterWidth":50,"borderInnerWidth":50,"borderOuterSoftness":0,"borderInnerSoftness":0,"borderBevelSoftness":0,"borderBevelPosition":50,"borderHue":0,"borderSaturation":0,"borderLuma":1000,"borderLightSourceDirection":360,"borderLightSourceAltitude":25}}'
		},
		{
			_id: '',
			DVEName: 'om lidt',
			BackgroundLoop: 'loopy',
			DVEJSON:
				'{"boxes":{"0":{"enabled":true,"source":0,"x":0,"y":450,"size":500,"cropped":false,"cropTop":0,"cropBottom":0,"cropLeft":0,"cropRight":0},"1":{"enabled":true,"source":0,"x":50,"y":580,"size":256,"cropped":false,"cropTop":0,"cropBottom":0,"cropLeft":0,"cropRight":0},"2":{"enabled":true,"source":0,"x":-800,"y":-450,"size":500,"cropped":false,"cropTop":0,"cropBottom":0,"cropLeft":0,"cropRight":0},"3":{"enabled":true,"source":0,"x":800,"y":-450,"size":500,"cropped":false,"cropTop":0,"cropBottom":0,"cropLeft":0,"cropRight":0}},"index":0,"properties":{"artFillSource":3010,"artCutSource":3011,"artOption":0,"artPreMultiplied":false,"artClip":500,"artGain":700,"artInvertKey":false},"border":{"borderEnabled":false,"borderBevel":1,"borderOuterWidth":50,"borderInnerWidth":50,"borderOuterSoftness":0,"borderInnerSoftness":0,"borderBevelSoftness":0,"borderBevelPosition":50,"borderHue":0,"borderSaturation":0,"borderLuma":1000,"borderLightSourceDirection":360,"borderLightSourceAltitude":25}}'
		}
	],
	WipesConfig: [
		{ _id: '', EffektNumber: 1, ClipName: 'effekt_1', Duration: 100, StartAlpha: 25, EndAlpha: 25 },
		{ _id: '', EffektNumber: 2, ClipName: 'effekt_1', Duration: 100, StartAlpha: 25, EndAlpha: 25 },
		{ _id: '', EffektNumber: 3, ClipName: 'effekt_1', Duration: 100, StartAlpha: 25, EndAlpha: 25 }
	],
	BreakerConfig: []
}
