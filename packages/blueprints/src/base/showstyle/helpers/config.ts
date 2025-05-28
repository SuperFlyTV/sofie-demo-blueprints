import { IShowStyleContext, IShowStyleUserContext } from '@sofie-automation/blueprints-integration'
import { SuperSource } from '../../../code-copy/atem-connection/index.js'
import { BlueprintConfig as BlueprintConfigBase, StudioConfig } from '../../studio/helpers/config.js'
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
		//@ts-expect-error - is returned as any:
		studio: context.getStudioConfig().studio as StudioConfig,
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
