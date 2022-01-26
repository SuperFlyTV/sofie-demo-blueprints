import {
	IAdLibFilterLink,
	IBlueprintTriggeredActions,
	IGUIContextFilterLink,
	IOutputLayer,
	IRundownPlaylistFilterLink,
	ISourceLayer,
	ITranslatableMessage,
	MigrationContextShowStyle,
	MigrationStepInput,
	MigrationStepInputFilteredResult,
	MigrationStepShowStyle,
	PlayoutActions,
	TriggerType,
} from '@sofie-automation/blueprints-integration'
import * as _ from 'underscore'
import { literal } from '../../common/util'
import { SourceLayer } from '../layers'

export function getSourceLayerDefaultsMigrationSteps(
	versionStr: string,
	sourcelayerDefaults: ISourceLayer[]
): MigrationStepShowStyle[] {
	return _.compact(
		_.map(sourcelayerDefaults, (defaultVal: ISourceLayer): MigrationStepShowStyle | null => {
			return literal<MigrationStepShowStyle>({
				id: `sourcelayer.defaults.${defaultVal._id}`,
				version: versionStr,
				canBeRunAutomatically: true,
				validate: (context: MigrationContextShowStyle) => {
					if (!context.getSourceLayer(defaultVal._id)) {
						return `SourceLayer "${defaultVal._id}" doesn't exist on ShowBaseStyle`
					}
					return false
				},
				migrate: (context: MigrationContextShowStyle) => {
					if (!context.getSourceLayer(defaultVal._id)) {
						context.insertSourceLayer(defaultVal._id, defaultVal)
					}
				},
			})
		})
	)
}

export function getOutputLayerDefaultsMigrationSteps(
	versionStr: string,
	outputLayerDefaults: IOutputLayer[]
): MigrationStepShowStyle[] {
	return _.compact(
		_.map(outputLayerDefaults, (defaultVal: IOutputLayer): MigrationStepShowStyle | null => {
			return literal<MigrationStepShowStyle>({
				id: `outputlayer.defaults.${defaultVal._id}`,
				version: versionStr,
				canBeRunAutomatically: true,
				validate: (context: MigrationContextShowStyle) => {
					if (!context.getOutputLayer(defaultVal._id)) {
						return `OutputLayer "${defaultVal._id}" doesn't exist on ShowBaseStyle`
					}
					return false
				},
				migrate: (context: MigrationContextShowStyle) => {
					if (!context.getOutputLayer(defaultVal._id)) {
						context.insertOutputLayer(defaultVal._id, defaultVal)
					}
				},
			})
		})
	)
}

export function getTriggeredActionsMigrationSteps(
	versionStr: string,
	triggeredActionsDefaults: IBlueprintTriggeredActions[]
): MigrationStepShowStyle[] {
	return _.compact(
		_.map(triggeredActionsDefaults, (defaultVal: IBlueprintTriggeredActions): MigrationStepShowStyle | null => {
			return literal<MigrationStepShowStyle>({
				id: `triggeredActions.defaults.${defaultVal._id}`,
				version: versionStr,
				canBeRunAutomatically: false,
				input: [
					literal<MigrationStepInput>({
						label: `Replace AdLib Triggers with new defaults for ${defaultVal.name || defaultVal._id}?`,
						inputType: 'checkbox',
						attribute: 'forceToDefaults',
						defaultValue: false,
					}),
				],
				validate: (context: MigrationContextShowStyle, afterMigration: boolean) => {
					const existingAction = context.getTriggeredAction(defaultVal._id)

					if (!existingAction) {
						return `Action Trigger "${defaultVal._id}" doesn't exist on ShowStyleBase`
					}

					const askForDefaults =
						!afterMigration &&
						existingAction.actions
							.map((action) => action.filterChain.sort().join())
							.sort()
							.join() !==
							defaultVal.actions
								.map((action) => action.filterChain.sort().join())
								.sort()
								.join()
					if (askForDefaults) {
						return `Action Trigger "${defaultVal._id}" will be set to defaults`
					}

					return false
				},
				migrate: (context: MigrationContextShowStyle, input: MigrationStepInputFilteredResult) => {
					const existingAction = context.getTriggeredAction(defaultVal._id)

					const setToDefault =
						input['forceToDefaults'] &&
						existingAction?.actions
							.map((action) => action.filterChain.sort().join())
							.sort()
							.join() !==
							defaultVal.actions
								.map((action) => action.filterChain.sort().join())
								.sort()
								.join()
					if (!existingAction || setToDefault) {
						context.setTriggeredAction(defaultVal)
					}
				},
			})
		})
	)
}

export function removeSourceLayer(versionStr: string, layer: string): MigrationStepShowStyle | undefined {
	return literal<MigrationStepShowStyle>({
		id: `sourcelayer.${layer}`,
		version: versionStr,
		canBeRunAutomatically: true,
		validate: (context: MigrationContextShowStyle) => {
			const existing = context.getSourceLayer(layer)
			if (!existing) {
				return false
			} // Nothing to update

			return `SourceLayer "${layer}" needs to be deleted`
		},
		migrate: (context: MigrationContextShowStyle) => {
			context.removeSourceLayer(layer)
		},
	})
}

const triggeredActionIdMap: Map<string, number> = new Map()

/**
 * These are supposed to be "locally" unique and the result will depend the order of it being called. That's on purpose
 * so that it's easy to replace a given hotkey with a different one.
 *
 * @param {string} prefix
 * @param {string} sourceLayerId
 * @param {boolean} globalAdLib
 * @param {number} pick
 * @return {*}
 */
function makeActionTriggerId(prefix: string, sourceLayerId: string, globalAdLib: boolean, pick: number) {
	const builtId = `${prefix}_${sourceLayerId}_` + (globalAdLib ? 'global_' : '') + `pick${pick}`
	const idx = (triggeredActionIdMap.get(builtId) ?? -1) + 1
	triggeredActionIdMap.set(builtId, idx)
	return `${builtId}_${idx}`
}

let rankCounter = 0

export function createAdLibHotkey(
	keys: string,
	sourceLayerIds: SourceLayer[],
	globalAdLib: boolean,
	pick: number,
	tags: string[] | undefined,
	label?: ITranslatableMessage
): IBlueprintTriggeredActions {
	return {
		_id: makeActionTriggerId('adLib', sourceLayerIds.join('_'), !!globalAdLib, pick),
		_rank: rankCounter++ * 1000,
		actions: [
			{
				action: PlayoutActions.adlib,
				filterChain: [
					{
						object: 'view',
					},
					{
						object: 'adLib',
						field: 'sourceLayerId',
						value: sourceLayerIds,
					},
					{
						object: 'adLib',
						field: 'global',
						value: globalAdLib,
					},
					!globalAdLib // if not a Global AdLib, trigger only if it's coming from the current segment
						? {
								object: 'adLib',
								field: 'segment',
								value: 'current',
						  }
						: undefined,
					tags !== undefined && tags.length > 0
						? {
								object: 'adLib',
								field: 'tag',
								value: tags,
						  }
						: undefined,
					{
						object: 'adLib',
						field: 'pick',
						value: pick,
					},
				].filter(Boolean) as (IRundownPlaylistFilterLink | IGUIContextFilterLink | IAdLibFilterLink)[],
			},
		],
		triggers: [
			{
				type: TriggerType.hotkey,
				keys: keys,
				up: true,
			},
		],
		name: label,
	}
}
