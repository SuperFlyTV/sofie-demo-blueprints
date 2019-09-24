import { ConfigItemValue } from 'tv-automation-sofie-blueprints-integration'

export interface ConfigMap {
	[key: string]: ConfigItemValue
}

// in here will be some mock configs that can be referenced paired with ro's for the tests
export const DefaultStudioConfig: ConfigMap = {}

export const DefaultShowStyleConfig: ConfigMap = {}
