import {
	BlueprintResultPart,
	BlueprintResultSegment,
	ISegmentUserContext,
} from '@sofie-automation/blueprints-integration'
import { PartContext } from '../../../common/context.js'
import { t } from '../../../common/util.js'
import {
	CameraProps,
	DVEProps,
	GfxProps,
	InvalidProps,
	PartProps,
	PartType,
	SegmentProps,
	TitlesProps,
	VOProps,
	VTProps,
} from '../definitions/index.js'
import { generateCameraPart } from './camera.js'
import { generateDVEPart } from './dve.js'
import { generateGfxPart } from './gfx.js'
import { generateRemotePart } from './remote.js'
import { generateOpenerPart as generateTitlesPart } from './titles.js'
import { generateVOPart } from './vo.js'
import { generateVTPart } from './vt.js'

export function generateParts(context: ISegmentUserContext, intermediateSegment: SegmentProps): BlueprintResultSegment {
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
			case PartType.GFX:
				return generateGfxPart(partContext, rawPart as unknown as PartProps<GfxProps>)
			case PartType.Invalid:
				return {
					part: {
						externalId: rawPart.payload.externalId,
						title: rawPart.payload.name,
						invalid: true,
						invalidReason: {
							message: (rawPart.payload as InvalidProps).invalidReason,
						},
					},
					pieces: [],
					adLibPieces: [],
					actions: [],
				}
			default:
				return {
					part: {
						externalId: rawPart.payload.externalId,
						title: rawPart.payload.name,
						invalid: true,
						invalidReason: {
							message: t(`Parts generation for ${rawPart.type} not implemented`),
						},
					},
					pieces: [],
					adLibPieces: [],
					actions: [],
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
