import { StudioConfig } from '../../base/studio/helpers/config'
import { baseManifest } from '../../base/studio/manifest'
import { StudioBlueprintManifest } from '@sofie-automation/blueprints-integration'
import { StudioConfigPresets } from './configs'

const manifest: StudioBlueprintManifest<StudioConfig> = {
	...baseManifest,

	blueprintId: 'demo-main-studio',

	configPresets: StudioConfigPresets,
}

export default manifest
