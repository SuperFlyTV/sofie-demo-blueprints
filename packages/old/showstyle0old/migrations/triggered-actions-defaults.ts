import { IBlueprintTriggeredActions } from '@sofie-automation/blueprints-integration'
import { literal } from '../../common/util'
import { SourceLayer } from '../layers'
import { createAdLibHotkey } from './util'

export const TriggeredActionsDefaults = literal<IBlueprintTriggeredActions[]>([
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
])
