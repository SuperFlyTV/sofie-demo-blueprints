import {
	BlueprintMapping,
	ConfigItemValue,
	IBlueprintRuntimeArgumentsItem,
	IOutputLayer,
	ISourceLayer,
	MigrationContextShowStyle,
	MigrationContextStudio,
	MigrationStepInput,
	MigrationStepInputFilteredResult,
	MigrationStepShowStyle,
	MigrationStepStudio
} from 'tv-automation-sofie-blueprints-integration'
import * as _ from 'underscore'
import { literal } from '../../common/util'
import { StudioConfigManifest } from '../config-manifests'
import MappingsDefaults, { getHyperdeckMappings } from './mappings-defaults'
import OutputlayerDefaults from './outputlayer-defaults'
import RuntimeArgumentsDefaults from './runtime-arguments-defaults'
import SourcelayerDefaults from './sourcelayer-defaults'

export function ensureStudioConfig(
	version: string,
	configName: string,
	value: any | null, // null if manual
	inputType: 'text' | 'multiline' | 'int' | 'checkbox' | 'dropdown' | 'switch' | undefined, // EditAttribute types
	label: string,
	description: string,
	defaultValue?: any,
	oldConfigName?: string,
	dropdownOptions?: string[]
): MigrationStepStudio {
	return {
		id: `studioConfig.${configName}`,
		version,
		canBeRunAutomatically: _.isNull(value) ? false : true,
		validate: (context: MigrationContextStudio) => {
			const configVal = context.getConfig(configName)
			const oldConfigVal = oldConfigName && context.getConfig(oldConfigName)
			if (configVal === undefined && oldConfigVal === undefined) {
				return `${configName} is missing`
			}

			return false
		},
		input: (context: MigrationContextStudio) => {
			const inputs: MigrationStepInput[] = []
			const configVal = context.getConfig(configName)

			if (inputType && configVal === undefined) {
				inputs.push({
					label,
					description,
					inputType,
					attribute: 'value',
					defaultValue,
					dropdownOptions
				})
			}
			return inputs
		},
		migrate: (context: MigrationContextStudio, input: MigrationStepInputFilteredResult) => {
			context.setConfig(configName, _.isNull(value) ? input.value : value)
		}
	}
}

export function renameStudioConfig(
	version: string,
	oldConfigName: string,
	newConfigName: string,
	updateValue?: (val: any) => ConfigItemValue
): MigrationStepStudio {
	return {
		id: `studioConfig.${oldConfigName}`,
		version,
		canBeRunAutomatically: true,
		validate: (context: MigrationContextStudio) => {
			const configVal = context.getConfig(oldConfigName)
			if (configVal !== undefined) {
				return `${oldConfigName} is defined`
			}

			return false
		},
		migrate: (context: MigrationContextStudio) => {
			const configVal = context.getConfig(oldConfigName)
			if (configVal !== undefined) {
				context.setConfig(newConfigName, updateValue ? updateValue(configVal) : configVal)
				context.removeConfig(oldConfigName)
			}
		}
	}
}

export function renameMapping(version: string, oldMappingName: string, newMappingName: string): MigrationStepStudio {
	return {
		id: `studioMapping.${oldMappingName}`,
		version,
		canBeRunAutomatically: true,
		validate: (context: MigrationContextStudio) => {
			const mapping = context.getMapping(oldMappingName)
			if (mapping !== undefined) {
				return `${oldMappingName} is defined`
			}

			return false
		},
		migrate: (context: MigrationContextStudio) => {
			const mapping = context.getMapping(oldMappingName)
			if (mapping) {
				context.insertMapping(newMappingName, mapping)
				context.removeMapping(oldMappingName)
			}
		}
	}
}

export function removeMapping(version: string, oldMappingName: string): MigrationStepStudio {
	return {
		id: `studioMapping.${oldMappingName}`,
		version,
		canBeRunAutomatically: true,
		validate: (context: MigrationContextStudio) => {
			const mapping = context.getMapping(oldMappingName)
			if (mapping) {
				return `${oldMappingName} is defined`
			}

			return false
		},
		migrate: (context: MigrationContextStudio) => {
			const mapping = context.getMapping(oldMappingName)
			if (mapping) {
				context.removeMapping(oldMappingName)
			}
		}
	}
}

export function getMappingsDefaultsMigrationSteps(versionStr: string): MigrationStepStudio[] {
	const res = _.compact(
		_.map(MappingsDefaults, (defaultVal: BlueprintMapping, id: string): MigrationStepStudio | null => {
			return literal<MigrationStepStudio>({
				id: `mappings.defaults.${id}`,
				version: versionStr,
				canBeRunAutomatically: true,
				validate: (context: MigrationContextStudio) => {
					// Optional mappings based on studio settings can be dropped here

					if (!context.getMapping(id)) {
						return `Mapping "${id}" doesn't exist on ShowBaseStyle`
					}
					return false
				},
				migrate: (context: MigrationContextStudio) => {
					if (!context.getMapping(id)) {
						context.insertMapping(id, defaultVal)
					}
				}
			})
		})
	)

	const hyperdeckCount = (context: MigrationContextStudio) => {
		const configCount = context.getConfig('HyperdeckCount')
		if (typeof configCount === 'number') {
			return configCount
		} else {
			const defaultVal = StudioConfigManifest.find(c => c.id === 'HyperdeckCount')
			if (defaultVal === undefined) {
				throw new Error('Expected HyperdeckCount to be defined in StudioConfigManifest')
			} else {
				return defaultVal.defaultVal as number
			}
		}
	}

	res.push(
		literal<MigrationStepStudio>({
			id: `mappings.defaults._all_hyperdeck_`,
			version: versionStr,
			canBeRunAutomatically: true,
			dependOnResultFrom: 'studioConfig.HyperdeckCount',
			validate: (context: MigrationContextStudio) => {
				const expected = _.keys(getHyperdeckMappings(hyperdeckCount(context)))

				let mappingMissing: string | boolean = false
				_.each(expected, f => {
					if (!context.getMapping(f)) {
						mappingMissing = `${f} is missing`
					}
				})

				return mappingMissing
			},
			migrate: (context: MigrationContextStudio) => {
				const expected = getHyperdeckMappings(hyperdeckCount(context))

				_.each(expected, (v, k) => {
					if (!context.getMapping(k)) {
						context.insertMapping(k, v)
					}
				})
			}
		})
	)

	return res
}

export function getSourceLayerDefaultsMigrationSteps(versionStr: string): MigrationStepShowStyle[] {
	return _.compact(
		_.map(SourcelayerDefaults, (defaultVal: ISourceLayer): MigrationStepShowStyle | null => {
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
				}
			})
		})
	)
}

export function getOutputLayerDefaultsMigrationSteps(versionStr: string): MigrationStepShowStyle[] {
	return _.compact(
		_.map(OutputlayerDefaults, (defaultVal: IOutputLayer): MigrationStepShowStyle | null => {
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
				}
			})
		})
	)
}

export function getRuntimeArgumentsDefaultsMigrationSteps(versionStr: string): MigrationStepShowStyle[] {
	return _.compact(
		_.map(RuntimeArgumentsDefaults, (defaultVal: IBlueprintRuntimeArgumentsItem): MigrationStepShowStyle | null => {
			return literal<MigrationStepShowStyle>({
				id: `runtimeArguments.defaults.${defaultVal._id}`,
				version: versionStr,
				canBeRunAutomatically: true,
				validate: (context: MigrationContextShowStyle) => {
					if (!context.getRuntimeArgument(defaultVal._id)) {
						return `RuntimeArgument "${defaultVal._id}" doesn't exist on ShowBaseStyle`
					}
					return false
				},
				migrate: (context: MigrationContextShowStyle) => {
					if (!context.getRuntimeArgument(defaultVal._id)) {
						context.insertRuntimeArgument(defaultVal._id, defaultVal)
					}
				}
			})
		})
	)
}
