import { StudioConfig } from '../../base/studio/helpers/config.js'
import { baseManifest } from '../../base/studio/manifest.js'
import { StudioBlueprintManifest } from '@sofie-automation/blueprints-integration'
import { StudioConfigPresets } from './configs/index.js'

const manifest: StudioBlueprintManifest<StudioConfig> = {
	...baseManifest,

	blueprintId: 'demo-main-studio',

	configPresets: StudioConfigPresets,
}

export default manifest
