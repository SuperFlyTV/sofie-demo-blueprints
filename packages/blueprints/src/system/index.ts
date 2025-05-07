import { BlueprintManifestType, SystemBlueprintManifest } from '@sofie-automation/blueprints-integration'

declare const __VERSION__: string // Injected by webpack
declare const __VERSION_TSR__: string // Injected by webpack
declare const __VERSION_INTEGRATION__: string // Injected by webpack

const manifest: SystemBlueprintManifest = {
	blueprintType: BlueprintManifestType.SYSTEM,

	coreMigrations: [],

	blueprintId: 'sofie-demo-system',
	blueprintVersion: __VERSION__,
	integrationVersion: __VERSION_INTEGRATION__,
	TSRVersion: __VERSION_TSR__,
}

export default manifest
