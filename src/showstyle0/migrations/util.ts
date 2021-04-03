import {
	IOutputLayer,
	ISourceLayer,
	MigrationContextShowStyle,
	MigrationStepShowStyle,
} from '@sofie-automation/blueprints-integration'
import * as _ from 'underscore'
import { literal } from '../../common/util'

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

export function updateSourceLayerHotkeys(
	versionStr: string,
	sourceLayerDefaults: ISourceLayer[],
	layer: string
): MigrationStepShowStyle | undefined {
	const filledOptionals: Pick<
		Required<ISourceLayer>,
		| 'activateKeyboardHotkeys'
		| 'clearKeyboardHotkey'
		| 'assignHotkeysToGlobalAdlibs'
		| 'isSticky'
		| 'activateStickyKeyboardHotkey'
		| 'isQueueable'
	> = {
		activateKeyboardHotkeys: '',
		clearKeyboardHotkey: '',
		assignHotkeysToGlobalAdlibs: false,
		isSticky: false,
		activateStickyKeyboardHotkey: '',
		isQueueable: false,
	}
	const fields = Object.keys(filledOptionals) as Array<keyof ISourceLayer>

	const newDefaults = _.find(sourceLayerDefaults, (s) => s._id === layer)

	if (newDefaults) {
		const nonOptionalDefaults = {
			...filledOptionals,
			...newDefaults,
		}
		return literal<MigrationStepShowStyle>({
			id: `sourcelayer.hotkeys.${layer}`,
			version: versionStr,
			canBeRunAutomatically: true,
			validate: (context: MigrationContextShowStyle) => {
				const existing = context.getSourceLayer(layer)
				if (!existing) {
					return false
				} // Nothing to update

				const filledExisting = {
					...filledOptionals,
					...existing,
				}
				const result: string[] = []
				_.each(fields, (f) => {
					if (filledExisting[f] !== nonOptionalDefaults[f]) {
						result.push(f)
					}
				})

				if (result.length > 0) {
					return `SourceLayer needs "${layer}": ${result.join(',')} to be updated`
				}

				return false
			},
			migrate: (context: MigrationContextShowStyle) => {
				if (context.getSourceLayer(layer)) {
					context.updateSourceLayer(layer, _.pick(newDefaults, fields))
				}
			},
		})
	} else {
		return undefined
	}
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
