import { IBlueprintAdLibPiece, PartContext, PieceLifespan } from 'tv-automation-sofie-blueprints-integration'
import { literal } from '../../../common/util'
import { BlueprintConfig } from '../../../tv2_afvd_showstyle/helpers/config'
import { PartDefinition } from '../../../tv2_afvd_showstyle/inewsConversion/converters/ParseBody'
import { PieceMetaData } from '../../../tv2_afvd_studio/onTimelineGenerate'
import { MEDIA_PLAYER_AUTO } from '../../../types/constants'
import { CueDefinitionAdLib, CueDefinitionDVE, CueType } from '../../inewsConversion/converters/ParseCue'
import { SourceLayer } from '../../layers'
import { MakeContentDVE } from '../content/dve'
import { MakeContentServer } from '../content/server'
import { DVEConfig, GetDVETemplate, TemplateIsValid } from './dve'

export function EvaluateAdLib(
	context: PartContext,
	config: BlueprintConfig,
	adLibPieces: IBlueprintAdLibPiece[],
	partId: string,
	parsedCue: CueDefinitionAdLib,
	partDefinition: PartDefinition,
	rank: number
) {
	if (parsedCue.variant.match(/server/i)) {
		// Create server AdLib
		const file = partDefinition.fields.videoId
		const duration = Number(partDefinition.fields.tapeTime) * 1000 || 0

		adLibPieces.push(
			literal<IBlueprintAdLibPiece>({
				_rank: rank,
				externalId: partId,
				name: `Server: ${file}`,
				sourceLayerId: SourceLayer.PgmServer,
				outputLayerId: 'pgm0',
				expectedDuration: duration,
				infiniteMode: PieceLifespan.OutOnNextPart,
				metaData: literal<PieceMetaData>({
					mediaPlayerSessions: [MEDIA_PLAYER_AUTO]
				}),
				content: MakeContentServer(file, duration, partId, true)
			})
		)
	} else {
		// DVE
		if (!parsedCue.variant) {
			return
		}

		const rawTemplate = GetDVETemplate(config.showStyle.DVEStyles, parsedCue.variant) // TODO: pull from config
		if (!rawTemplate) {
			context.warning(`Could not find template ${parsedCue.variant}`)
			return
		}
		// @todo: To be pulled from a story cue
		// const background: string = rawTemplate.BackgroundLoop as string
		const background = 'amb' // @todo: hardcode!

		if (!TemplateIsValid(JSON.parse(rawTemplate.DVEJSON as string))) {
			context.warning(`Invalid DVE template ${parsedCue.variant}`)
			return
		}

		const cueDVE: CueDefinitionDVE = {
			type: CueType.DVE,
			template: parsedCue.variant,
			sources: parsedCue.inputs ? parsedCue.inputs : [],
			labels: parsedCue.bynavn ? [parsedCue.bynavn] : []
		}

		// const template: DVEConfig = JSON.parse(rawTemplate.DVEJSON as string) as DVEConfig
		const template: DVEConfig = JSON.parse(rawTemplate.DVEJSON as string) as DVEConfig

		const content = MakeContentDVE(context, config, partId, cueDVE, template, background)

		adLibPieces.push(
			literal<IBlueprintAdLibPiece>({
				_rank: rank,
				externalId: partId,
				name: `DVE: ${parsedCue.variant}`,
				sourceLayerId: SourceLayer.PgmDVE,
				outputLayerId: 'pgm0',
				content: content.content,
				invalid: !content.valid
			})
		)
	}
}
