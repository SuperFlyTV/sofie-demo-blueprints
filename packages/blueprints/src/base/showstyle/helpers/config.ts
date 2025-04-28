import { IShowStyleContext, IShowStyleUserContext } from '@sofie-automation/blueprints-integration'
import { SuperSource } from '../../../copy/atem-connection'
import { BlueprintConfig as BlueprintConfigBase, getStudioConfig } from '../../studio/helpers/config'
import { ShowStyleConfig as ShowStyleConfig0 } from '../../../generated/showStyle-config'

export interface BlueprintConfig extends BlueprintConfigBase {
	showStyle: Readonly<ShowStyleConfig>
	dvePresets: { name: string; boxes: number; preset: SuperSource }[]
}

export type ShowStyleConfig = ShowStyleConfig0

export function parseConfig(context: IShowStyleContext | IShowStyleUserContext): BlueprintConfig {
	const showStyle = context.getShowStyleConfig() as ShowStyleConfig
	return {
		studio: getStudioConfig(context),
		showStyle,

		dvePresets: Object.values(showStyle.dvePresets)
			.map((p) => {
				try {
					return {
						...p,
						preset: JSON.parse(p.preset),
					}
				} catch {
					return undefined
				}
			})
			.filter((p): p is BlueprintConfig['dvePresets'][number] => p !== undefined),
	}
}
