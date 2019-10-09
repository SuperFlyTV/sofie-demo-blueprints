import { ConfigItemValue } from 'tv-automation-sofie-blueprints-integration'
import { MediaPlayerType } from '../../tv2_afvd_studio/config-manifests'

export interface ConfigMap {
	[key: string]: ConfigItemValue
}

// in here will be some mock configs that can be referenced paired with ro's for the tests
export const defaultStudioConfig: ConfigMap = {
	MediaPlayerType: '',
	SourcesCam:
		'1:1,2:2,3:3,4:4,5:5,1S:6,2S:7,3S:8,4S:9,5S:10,X8:13,HVID:14,AR:16,CS1:17,CS2:18,CS3:19,CS4:20,CS5:21,CS 1:17,CS 2:18,CS 3:19,CS 4:20,CS 5:21,SORT:22,11:11,12:12,13:13,14:14,15:15'
}

export const casparABPlaybackConfig: ConfigMap = {
	...defaultStudioConfig,
	CONFIG_ID: 'CasparAB',
	MediaPlayerType: MediaPlayerType.CasparAB
}

export const defaultShowStyleConfig: ConfigMap = {}
