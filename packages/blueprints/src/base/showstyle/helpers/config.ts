import { IShowStyleContext, IShowStyleUserContext } from '@sofie-automation/blueprints-integration'
import { SuperSource } from '../../../code-copy/atem-connection/index.js'
import { BlueprintConfig as BlueprintConfigBase, getStudioConfig } from '../../studio/helpers/config.js'
import {
	DVELayoutConfig,
	ShowStyleConfig as ShowStyleConfig0,
} from '../../../$schemas/generated/main-showstyle-config.js'

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

		dvePresets: Object.values<DVELayoutConfig>(showStyle.dvePresets)
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
