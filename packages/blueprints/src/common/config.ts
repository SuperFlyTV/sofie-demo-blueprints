import objectPath = require('object-path')
import { ConfigItemValue, ConfigManifestEntry, IBlueprintConfig } from '@sofie-automation/blueprints-integration'

export const CORE_INJECTED_CONFIG_KEYS = ['SofieHostURL']

export function parseConfigManifest<T>(
	manifest: ConfigManifestEntry[],
	overrides: IBlueprintConfig,
	isStudio: boolean
): T {
	const config: any = {}

	for (const val of manifest) {
		const overrideVal = overrides[val.id] as ConfigItemValue | undefined
		const newVal = overrideVal

		objectPath.set(config, val.id, newVal)
	}

	if (isStudio) {
		for (const id of CORE_INJECTED_CONFIG_KEYS) {
			objectPath.set(config, id, id)
		}
	}

	return config
}
