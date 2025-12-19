import {
	IAdLibFilterLink,
	IBlueprintTriggeredActions,
	IGUIContextFilterLink,
	IRundownPlaylistFilterLink,
	ITranslatableMessage,
	PlayoutActions,
	TriggerType,
} from '@sofie-automation/blueprints-integration'
import { SourceLayer } from './layers.js'
import { createAdLibHotkeyWithTriggerMode } from '../executeActions/steppedGraphicExample.js'

const triggeredActionIdMap: Map<string, number> = new Map()
let rankCounter = 0

export function getTriggeredActions(): IBlueprintTriggeredActions[] {
	const triggeredActions = [
		// Take action with spacebar
		{
			_id: 'demo_take_space',
			_rank: ++rankCounter * 1000,
			name: 'Take (Space)',
			actions: {
				'0': {
					action: PlayoutActions.take,
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
					keys: 'Space',
				},
			},
		} as IBlueprintTriggeredActions,
		...['F1', 'F2', 'F3', 'F4', 'F5', 'F6'].map((key, i) =>
			createAdLibHotkey(key, [SourceLayer.Camera], true, i, undefined)
		),
		...['F7', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5'].map((key, i) =>
			createAdLibHotkey(key, [SourceLayer.Remote], true, i, undefined)
		),
		...['F8'].map((key, i) => createAdLibHotkey(key, [SourceLayer.DVE], true, i, undefined)),
		...['KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY'].map((key, i) =>
			createAdLibHotkey(key, [SourceLayer.LowerThird, SourceLayer.LowerThird, SourceLayer.Ticker], false, i, undefined)
		),
		...['KeyV', 'Shift+KeyV'].map((key, i) => createAdLibHotkey(key, [SourceLayer.HostOverride], true, i, undefined)),
		createAdLibHotkeyWithTriggerMode(rankCounter),
	]
	return triggeredActions
}

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
		actions: {
			[PlayoutActions.adlib]: {
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
					tags && tags.length > 0
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
		},
		triggers: {
			[TriggerType.hotkey]: {
				type: TriggerType.hotkey,
				keys: keys,
				up: false,
			},
		},
		name: label,
	}
}
