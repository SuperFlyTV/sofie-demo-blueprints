import { BlueprintResultPart, BlueprintResultSegment, IRundownUserContext } from '@sofie-automation/blueprints-integration'
import { PartContext } from '../../common/context'
import { t } from '../../common/util'
import { CameraProps, DVEProps, InvalidProps, PartProps, PartType, SegmentProps, TitlesProps, VOProps, VTProps } from '../definitions'
import { generateCameraPart } from './camera'
import { generateDVEPart } from './dve'
import { generateOpenerPart as generateTitlesPart } from './titles'
import { generateRemotePart } from './remote'
import { generateVOPart } from './vo'
import { generateVTPart } from './vt'

export function generateParts(
	context: IRundownUserContext,
	intermediateSegment: SegmentProps
): BlueprintResultSegment {
	const parts = intermediateSegment.parts.map((rawPart): BlueprintResultPart => {
		const partContext = new PartContext(context, rawPart.payload.externalId)

		switch (rawPart.type) {
			case PartType.Camera:
				return generateCameraPart(partContext, rawPart as unknown as PartProps<CameraProps>)
			case PartType.Remote:
				return generateRemotePart(partContext, rawPart as unknown as PartProps<CameraProps>)
			case PartType.VT:
				return generateVTPart(partContext, rawPart as unknown as PartProps<VTProps>)
			case PartType.VO:
				return generateVOPart(partContext, rawPart as unknown as PartProps<VOProps>)
			case PartType.Titles:
				return generateTitlesPart(partContext, rawPart as unknown as PartProps<TitlesProps>)
			case PartType.DVE:
				return generateDVEPart(partContext, rawPart as unknown as PartProps<DVEProps>)
			case PartType.Invalid:
				return {
					part: {
						externalId: rawPart.payload.externalId,
						title: rawPart.payload.name,
						invalid: true,
						invalidReason: {
							message: (rawPart.payload as InvalidProps).invalidReason
						}
					},
					pieces: [],
					adLibPieces: [],
				}
			default:
				return {
					part: {
						externalId: rawPart.payload.externalId,
						title: rawPart.payload.name,
						invalid: true,
						invalidReason: {
							message: t(`Parts generation for ${rawPart.type} not implemented`)
						}
					},
					pieces: [],
					adLibPieces: [],
				}
		}
	})

	return {
		segment: {
			name: intermediateSegment.payload.name,
		},
		parts,
	}
}
