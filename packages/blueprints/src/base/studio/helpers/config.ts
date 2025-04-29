import { IStudioContext, IStudioUserContext } from '@sofie-automation/blueprints-integration'
import { StudioConfig as StudioConfig0 } from '../../../$schemas/generated/main-studio-config.js'

export { VisionMixerType, SourceType, AudioSourceType } from '../../../$schemas/generated/main-studio-config.js'

export interface BlueprintConfig {
	studio: StudioConfig
}

export type StudioConfig = StudioConfig0

export function getStudioConfig(context: IStudioUserContext | IStudioContext): StudioConfig {
	return context.getStudioConfig() as StudioConfig
}
