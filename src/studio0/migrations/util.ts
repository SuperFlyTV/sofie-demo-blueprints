import {
	BlueprintMapping,
	BlueprintMappings,
	ConfigItemValue,
	LookaheadMode,
	MigrationContextStudio,
	MigrationStepInput,
	MigrationStepInputFilteredResult,
	MigrationStepStudio,
} from '@sofie-automation/blueprints-integration'
import * as _ from 'underscore'
import { literal } from '../../common/util'
import { studioConfigManifest } from '../config-manifests'
import { StudioConfig } from '../helpers/config'
import MappingsDefaults, { getAllAuxMappings, getDynamicSisyfosMappings } from './mappings-defaults'

export function getConfigOrDefault(context: MigrationContextStudio, name: string): ConfigItemValue | undefined {
	const val = context.getConfig(name)
	if (val !== undefined) {
		return val
	}

	const def = _.find(studioConfigManifest, (c) => c.id === name)
	if (def) {
		return def.defaultVal
	} else {
		return undefined
	}
}
export function getMappingsDefaultsMigrationSteps(versionStr: string): MigrationStepStudio[] {
	const res = _.compact(
		_.map(MappingsDefaults, (defaultVal: BlueprintMapping, id: string): MigrationStepStudio | null => {
			return literal<MigrationStepStudio>({
				id: `mappings.defaults.${id}`,
				version: versionStr,
				canBeRunAutomatically: true,
				validate: (context: MigrationContextStudio): boolean | string => {
					if (!context.getMapping(id)) {
						return `Mapping "${id}" doesn't exist on ShowBaseStyle`
					}
					return false
				},
				migrate: (context: MigrationContextStudio): void => {
					if (!context.getMapping(id)) {
						// defaultVal.deviceId = defaultVal.deviceId
						context.insertMapping(id, defaultVal)
					}
				},
			})
		})
	)

	const getAuxMappings = (context: MigrationContextStudio): BlueprintMappings => {
		const auxes = getConfigOrDefault(context, 'atemOutputs')

		if (auxes) {
			const auxNumber = ((auxes as unknown) as StudioConfig['atemOutputs'])
				.map((aux) => aux.output)
				.sort()
				.reverse()[0]
			return getAllAuxMappings(auxNumber || 0)
		}

		return {}
	}

	res.push(
		literal<MigrationStepStudio>({
			id: `mappings.defaults._all_auxes_`,
			version: versionStr,
			canBeRunAutomatically: true,
			validate: (context: MigrationContextStudio): boolean | string => {
				const expected = _.keys(getAuxMappings(context))

				const badMappings: string[] = []
				_.each(expected, (f) => {
					const mapping = context.getMapping(f)
					if (!mapping) {
						badMappings.push(`${f} is missing`)
					}
				})

				return badMappings.length > 0 ? badMappings.join(', ') : false
			},
			migrate: (context: MigrationContextStudio): void => {
				const expected = getAuxMappings(context)

				_.each(expected, (v, k): void => {
					if (!context.getMapping(k)) {
						context.insertMapping(k, v)
					}
				})
			},
		})
	)
	
	const getSisyfosMappings = (context: MigrationContextStudio): BlueprintMappings => {
		const sources = getConfigOrDefault(context, 'sisyfosSources') as any as StudioConfig['sisyfosSources']

		if (sources) {
			return getDynamicSisyfosMappings(sources)
		}

		return {}
	}

	res.push(
		literal<MigrationStepStudio>({
			id: `mappings.defaults._all_sisyfos_dynamic_`,
			version: versionStr,
			canBeRunAutomatically: true,
			validate: (context: MigrationContextStudio): boolean | string => {
				const expected = _.keys(getSisyfosMappings(context))

				const badMappings: string[] = []
				_.each(expected, (f) => {
					const mapping = context.getMapping(f)
					if (!mapping) {
						badMappings.push(`${f} is missing`)
					}
				})

				return badMappings.length > 0 ? badMappings.join(', ') : false
			},
			migrate: (context: MigrationContextStudio): void => {
				const expected = getSisyfosMappings(context)

				_.each(expected, (v, k): void => {
					if (!context.getMapping(k)) {
						context.insertMapping(k, v)
					}
				})
			},
		})
	)

	return res
}

export function ensureStudioConfig<TConfig>(
	version: string,
	configName: keyof TConfig,
	value: any | null, // null if manual
	inputType: 'text' | 'multiline' | 'int' | 'checkbox' | 'dropdown' | 'switch' | undefined, // EditAttribute types
	label: string,
	description: string,
	defaultValue?: ConfigItemValue,
	dropdownOptions?: string[],
	dependOnResultFrom?: string
): MigrationStepStudio {
	return {
		id: `studioConfig.${configName}`,
		dependOnResultFrom,
		version,
		canBeRunAutomatically: !_.isNull(value),
		validate: (context: MigrationContextStudio): boolean | string => {
			const configVal = context.getConfig(configName as string)
			if (configVal === undefined) {
				return `${configName} is missing`
			}

			return false
		},
		input: (context: MigrationContextStudio): MigrationStepInput[] => {
			const inputs: MigrationStepInput[] = []
			const configVal = context.getConfig(configName as string)

			if (inputType && configVal === undefined) {
				inputs.push({
					label,
					description,
					inputType,
					attribute: 'value',
					defaultValue,
					dropdownOptions,
				})
			}
			return inputs
		},
		migrate: (context: MigrationContextStudio, input: MigrationStepInputFilteredResult): void => {
			context.setConfig(configName as string, _.isNull(value) ? input.value : value)
		},
	}
}

export function updateStudioConfig(
	version: string,
	configName: string,
	mutator: (val: any, validate: boolean) => any,
	dependOnResultFrom?: string
): MigrationStepStudio {
	return {
		id: `studioConfig.${configName}.update`,
		dependOnResultFrom,
		version,
		canBeRunAutomatically: true,
		validate: (context: MigrationContextStudio): boolean | string => {
			const configVal = context.getConfig(configName)
			try {
				const newConfigVal = mutator(configVal, true)
				if (configVal !== newConfigVal) {
					return `${configName} is missing`
				}
			} catch (e) {
				return e.toString()
			}

			return false
		},
		migrate: (context: MigrationContextStudio): void => {
			const configVal = context.getConfig(configName)
			context.setConfig(configName, mutator(configVal, false))
		},
	}
}

export function renameStudioConfig<TConfig>(
	version: string,
	oldConfigName: string,
	newConfigName: keyof TConfig,
	updateValue?: (val: any) => ConfigItemValue
): MigrationStepStudio {
	return {
		id: `studioConfig.${oldConfigName}`,
		version,
		canBeRunAutomatically: true,
		validate: (context: MigrationContextStudio): boolean | string => {
			const configVal = context.getConfig(oldConfigName)
			if (configVal !== undefined) {
				return `${oldConfigName} is defined`
			}

			return false
		},
		migrate: (context: MigrationContextStudio): void => {
			const configVal = context.getConfig(oldConfigName)
			if (configVal !== undefined) {
				context.setConfig(newConfigName as string, updateValue ? updateValue(configVal) : configVal)
				context.removeConfig(oldConfigName)
			}
		},
	}
}

export function removeStudioConfig(version: string, oldConfigName: string): MigrationStepStudio {
	return {
		id: `studioConfig.${oldConfigName}`,
		version,
		canBeRunAutomatically: true,
		validate: (context: MigrationContextStudio): boolean | string => {
			const configVal = context.getConfig(oldConfigName)
			if (configVal !== undefined) {
				return `${oldConfigName} is defined`
			}

			return false
		},
		migrate: (context: MigrationContextStudio): void => {
			context.removeConfig(oldConfigName)
		},
	}
}

export function renameMapping(version: string, oldMappingName: string, newMappingName: string): MigrationStepStudio {
	return {
		id: `studioMapping.${oldMappingName}`,
		version,
		canBeRunAutomatically: true,
		validate: (context: MigrationContextStudio): boolean | string => {
			const mapping = context.getMapping(oldMappingName)
			if (mapping !== undefined) {
				return `${oldMappingName} is defined`
			}

			return false
		},
		migrate: (context: MigrationContextStudio): void => {
			const mapping = context.getMapping(oldMappingName)
			if (mapping) {
				context.insertMapping(newMappingName, mapping)
				context.removeMapping(oldMappingName)
			}
		},
	}
}

export function removeMapping(version: string, oldMappingName: string): MigrationStepStudio {
	return {
		id: `studioMapping.${oldMappingName}`,
		version,
		canBeRunAutomatically: true,
		validate: (context: MigrationContextStudio): boolean | string => {
			const mapping = context.getMapping(oldMappingName)
			if (mapping) {
				return `${oldMappingName} is defined`
			}

			return false
		},
		migrate: (context: MigrationContextStudio): void => {
			const mapping = context.getMapping(oldMappingName)
			if (mapping) {
				context.removeMapping(oldMappingName)
			}
		},
	}
}

export function updateMappingLookahead(
	version: string,
	mapping: string,
	targetMode: LookaheadMode
): MigrationStepStudio {
	return {
		id: `mapping.${mapping}.lookahead`,
		version,
		canBeRunAutomatically: true,
		validate: (context: MigrationContextStudio): boolean | string => {
			const dbMapping = context.getMapping(mapping)
			if (dbMapping && dbMapping.lookahead !== targetMode) {
				return `Mapping "${mapping}" wrong lookahead mode`
			}

			return false
		},
		migrate: (context: MigrationContextStudio): void => {
			const dbMapping = context.getMapping(mapping)
			if (dbMapping) {
				context.updateMapping(mapping, {
					lookahead: targetMode,
				})
			}
		},
	}
}

export function translateGraphicsRendererUrl(
	version: string,
	newName: string,
	oldName: string,
	oldValue: string
): MigrationStepStudio {
	return literal<MigrationStepStudio>({
		id: `studioConfig.${newName}`,
		version: version,
		canBeRunAutomatically: true,
		validate: (context: MigrationContextStudio): boolean | string => {
			const oldConfig = context.getConfig(oldName)
			const newConfig = context.getConfig(newName)

			if (!oldConfig) {
				// Nothing to do
				return false
			}

			if (oldConfig === oldValue && !newConfig) {
				return `Config "${oldName}" needs to be updated to "${newName}"`
			}

			return `Config "${oldName}" needs to be updated to "${newName}", but this cannot be done automatically`
		},
		migrate: (context: MigrationContextStudio): void => {
			const oldConfig = context.getConfig(oldName)
			const newConfig = context.getConfig(newName)

			if (oldConfig === oldValue && !newConfig) {
				context.removeConfig(oldName)
			}
		},
	})
}
