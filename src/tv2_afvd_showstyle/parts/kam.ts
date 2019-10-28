import {
	AtemTransitionStyle,
	DeviceType,
	TimelineContentTypeAtem,
	TimelineObjAtemME
} from 'timeline-state-resolver-types'
import {
	BlueprintResultPart,
	IBlueprintAdLibPiece,
	IBlueprintPart,
	IBlueprintPiece,
	PartContext,
	PieceLifespan,
	SourceLayerType,
	TimelineObjectCoreExt
} from 'tv-automation-sofie-blueprints-integration'
import { literal } from '../../common/util'
import { FindSourceInfoStrict } from '../../tv2_afvd_studio/helpers/sources'
import { AtemLLayer } from '../../tv2_afvd_studio/layers'
import { BlueprintConfig } from '../helpers/config'
import { EvaluateCues } from '../helpers/pieces/evaluateCues'
import { AddScript } from '../helpers/pieces/script'
import { GetSisyfosTimelineObjForCamera } from '../helpers/sisyfos/sisyfos'
import { PartDefinition } from '../inewsConversion/converters/ParseBody'
import { SourceLayer } from '../layers'
import { CreatePartInvalid } from './invalid'
import { PartTime } from './time/partTime'

export function CreatePartKam(
	context: PartContext,
	config: BlueprintConfig,
	partDefinition: PartDefinition,
	totalWords: number
): BlueprintResultPart {
	const partTime = PartTime(partDefinition, totalWords)

	const part = literal<IBlueprintPart>({
		externalId: partDefinition.externalId,
		title: partDefinition.rawType,
		metaData: {},
		typeVariant: '',
		expectedDuration: partTime,
		displayDuration: partTime
	})

	const adLibPieces: IBlueprintAdLibPiece[] = []
	const pieces: IBlueprintPiece[] = []
	const sourceInfoCam = FindSourceInfoStrict(context, config.sources, SourceLayerType.CAMERA, partDefinition.rawType)
	if (sourceInfoCam === undefined) {
		return CreatePartInvalid(partDefinition)
	}
	const atemInput = sourceInfoCam.port

	pieces.push(
		literal<IBlueprintPiece>({
			_id: '',
			externalId: partDefinition.externalId,
			name: part.title,
			enable: { start: 0 },
			outputLayerId: 'pgm0',
			sourceLayerId: SourceLayer.PgmCam,
			infiniteMode: PieceLifespan.OutOnNextPart,
			content: {
				studioLabel: '',
				switcherInput: atemInput,
				timelineObjects: literal<TimelineObjectCoreExt[]>([
					literal<TimelineObjAtemME>({
						id: ``,
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
								transition: AtemTransitionStyle.CUT
							}
						}
					}),

					...GetSisyfosTimelineObjForCamera(partDefinition.rawType, false)
				])
			}
		})
	)

	EvaluateCues(context, config, pieces, adLibPieces, partDefinition.cues, partDefinition)
	AddScript(partDefinition, pieces)

	if (pieces.length === 0) {
		return CreatePartInvalid(partDefinition)
	}

	return {
		part,
		adLibPieces,
		pieces
	}
}
