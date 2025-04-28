import {
	ShowStyleConfig,
} from '../../../base/showstyle/helpers/config'
import { IShowStyleVariantConfigPreset } from '@sofie-automation/blueprints-integration'

type VariantsConfig = Pick<ShowStyleConfig, 'dvePresets'>

export const demo1Variants: Record<string, IShowStyleVariantConfigPreset<VariantsConfig>> = {
}
