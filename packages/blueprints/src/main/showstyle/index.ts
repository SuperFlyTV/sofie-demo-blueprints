import { ShowStyleConfig } from '../../base/showstyle/helpers/config'
import { baseManifest } from '../../base/showstyle/manifest'

import { ShowStyleBlueprintManifest } from '@sofie-automation/blueprints-integration'
import { getShowStyleConfigPreset } from './configPresets'

const manifest: ShowStyleBlueprintManifest<ShowStyleConfig> = {
	...baseManifest,

	blueprintId: 'demo-main-showstyle',

	configPresets: getShowStyleConfigPreset(),
}

export default manifest
