import { ShowStyleConfig } from '../../base/showstyle/helpers/config.js'
import { baseManifest } from '../../base/showstyle/manifest.js'

import { ShowStyleBlueprintManifest } from '@sofie-automation/blueprints-integration'
import { getShowStyleConfigPreset } from './configPresets.js'

const manifest: ShowStyleBlueprintManifest<ShowStyleConfig> = {
	...baseManifest,

	blueprintId: 'demo-main-showstyle',

	configPresets: getShowStyleConfigPreset(),
}

export default manifest
