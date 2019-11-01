import {
	AtemTransitionStyle,
	DeviceType,
	TimelineContentTypeAtem,
	TimelineObjAtemME
} from 'timeline-state-resolver-types'
import {
	IBlueprintPiece,
	PartContext,
	RemoteContent,
	SourceLayerType,
	TimelineObjectCoreExt
} from 'tv-automation-sofie-blueprints-integration'
import { literal } from '../../../common/util'
import { BlueprintConfig } from '../../../tv2_afvd_studio/helpers/config'
import { FindSourceInfoStrict } from '../../../tv2_afvd_studio/helpers/sources'
import { AtemLLayer } from '../../../tv2_afvd_studio/layers'
import { CueDefinitionEkstern } from '../../inewsConversion/converters/ParseCue'
import { SourceLayer } from '../../layers'
import { GetSisyfosTimelineObjForEkstern } from '../sisyfos/sisyfos'
import { CreateTimingEnable } from './evaluateCues'

export function EvaluateEkstern(
	context: PartContext,
	config: BlueprintConfig,
	pieces: IBlueprintPiece[],
	partId: string,
	parsedCue: CueDefinitionEkstern
) {
	const eksternProps = parsedCue.source
		.replace(/\s+/, ' ')
		.trim()
		.match(/^(?:LIVE|SKYPE) ([^\s]+)(?: (.+))?$/i)
	if (!eksternProps) {
		context.warning(`Could not find live source for ${parsedCue.source}, missing properties`)
		return
	}
	const source = eksternProps[1]
	if (!source) {
		context.warning(`Could not find live source for ${parsedCue.source}`)
		return
	}
	const sourceInfoCam = FindSourceInfoStrict(context, config.sources, SourceLayerType.REMOTE, parsedCue.source)
	if (sourceInfoCam === undefined) {
		context.warning(`Could not find ATEM input for source ${parsedCue.source}`)
		return
	}
	const atemInput = sourceInfoCam.port
	pieces.push(
		literal<IBlueprintPiece>({
			_id: '',
			externalId: partId,
			name: eksternProps[0],
			...CreateTimingEnable(parsedCue),
			outputLayerId: 'pgm0',
			sourceLayerId: SourceLayer.PgmLive,
			content: literal<RemoteContent>({
				studioLabel: '',
				switcherInput: atemInput,
				timelineObjects: literal<TimelineObjectCoreExt[]>([
					literal<TimelineObjAtemME>({
						id: '',
						enable: {
							start: 0
						},
						priority: 1,
						layer: AtemLLayer.AtemMEProgram,
						content: {
							deviceType: DeviceType.ATEM,
							type: TimelineContentTypeAtem.ME,
							me: {
								input: atemInput,
								transition: AtemTransitionStyle.CUT // TODO: This may change
							}
						}
					}),

					...GetSisyfosTimelineObjForEkstern(parsedCue.source, false)
				])
			})
		})
	)
}
