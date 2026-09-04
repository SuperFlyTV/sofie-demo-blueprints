import {
	BlueprintManifestType,
	BlueprintResultApplySystemConfig,
	ClientActions,
	IBlueprintTriggeredActions,
	SystemBlueprintManifest,
	TriggerType,
} from '@sofie-automation/blueprints-integration'

const manifest: SystemBlueprintManifest = {
	blueprintType: BlueprintManifestType.SYSTEM,

	blueprintId: 'sofie-demo-system',
	blueprintVersion: __VERSION__,
	integrationVersion: __VERSION_INTEGRATION__,
	TSRVersion: __VERSION_TSR__,
	translations: __TRANSLATION_BUNDLES__,
	applyConfig: (context) => {
		return {
			settings: {
				cron: {
					casparCGRestart: {
						enabled: false,
					},
				},
				evaluationsMessage: {
					enabled: false,
					heading: '',
					message: '',
				},
				support: {
					message: '',
				},
			},
			triggeredActions: [
				...Object.values<IBlueprintTriggeredActions>(context.getDefaultSystemActionTriggers()),
				{
					_id: 'edit_mode_on',
					_rank: 1000,
					name: 'Edit Mode On',
					actions: {
						'0': {
							action: ClientActions.editMode,
							state: true,
							filterChain: [
								{
									object: 'view',
								},
							],
						},
					},
					triggers: {
						'0': {
							type: TriggerType.hotkey,
							keys: 'Alt',
							up: false,
						},
					},
				} as IBlueprintTriggeredActions,
				{
					_id: 'edit_mode_off',
					_rank: 1001,
					name: 'Edit Mode Off',
					actions: {
						'0': {
							action: ClientActions.editMode,
							state: false,
							filterChain: [
								{
									object: 'view',
								},
							],
						},
					},
					triggers: {
						'0': {
							type: TriggerType.hotkey,
							keys: 'Alt',
							up: true,
						},
					},
				} as IBlueprintTriggeredActions,
			],
		} satisfies BlueprintResultApplySystemConfig
	},
}

export default manifest
