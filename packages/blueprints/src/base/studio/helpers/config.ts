import { IStudioContext, IStudioUserContext } from '@sofie-automation/blueprints-integration'
import { StudioConfig } from '../../../$schemas/generated/main-studio-config.js'

export * from '../../../$schemas/generated/main-studio-config.js'

export interface BlueprintConfig {
	studio: StudioConfig
}

export function getStudioConfig(context: IStudioUserContext | IStudioContext): StudioConfig {
	return context.getStudioConfig() as StudioConfig
}
