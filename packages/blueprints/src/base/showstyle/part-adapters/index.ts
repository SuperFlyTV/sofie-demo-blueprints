import {
	BlueprintResultPart,
	BlueprintResultSegment,
	ISegmentUserContext,
	JSONBlobStringify,
	JSONSchema,
	SourceLayerType,
	UserEditingDefinitionAction,
	UserEditingType,
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
import { BlueprintUserOperationTypes } from '../../studio/userEditOperations/types.js'

export function generateParts(context: ISegmentUserContext, intermediateSegment: SegmentProps): BlueprintResultSegment {
	// Create Segment UserEditOperations:
	const userEditOperationsOnSegment: UserEditingDefinitionAction[] = [
		{
			type: UserEditingType.ACTION,
			id: BlueprintUserOperationTypes.LOCK_SEGMENT_NRCS_UPDATES,
			label: t('Lock Segment for NRCS Updates'),
			svgIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <rect x="3" y="7" width="10" height="7" rx="1" ry="1" />
  <path d="M5 7V5a3 3 0 0 1 6 0v2" />
</svg>`,
			isActive: intermediateSegment.userEditStates?.[BlueprintUserOperationTypes.LOCK_SEGMENT_NRCS_UPDATES],
		},
	]

	const parts = intermediateSegment.parts.map((rawPart): BlueprintResultPart => {
		context.logDebug('Generating from rawPart: ' + JSON.stringify(rawPart))
		const partContext = new PartContext(context, rawPart.payload.externalId)
		let newPart: BlueprintResultPart

		switch (rawPart.type) {
			case PartType.Camera:
				newPart = generateCameraPart(partContext, rawPart as unknown as PartProps<CameraProps>)
				break
			case PartType.Remote:
				newPart = generateRemotePart(partContext, rawPart as unknown as PartProps<CameraProps>)
				break
			case PartType.VT:
				newPart = generateVTPart(partContext, rawPart as unknown as PartProps<VTProps>)
				break
			case PartType.VO:
				newPart = generateVOPart(partContext, rawPart as unknown as PartProps<VOProps>)
				break
			case PartType.Titles:
				newPart = generateTitlesPart(partContext, rawPart as unknown as PartProps<TitlesProps>)
				break
			case PartType.DVE:
				newPart = generateDVEPart(partContext, rawPart as unknown as PartProps<DVEProps>)
				break
			case PartType.GFX:
				newPart = generateGfxPart(partContext, rawPart as unknown as PartProps<GfxProps>)
				break
			case PartType.Invalid:
				newPart = {
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
				break
			default:
				newPart = {
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
		// Add userEditOperations to any part (include the segment ones?):
		newPart.part.userEditOperations = [...userEditOperationsOnSegment]

		newPart.part.userEditProperties = {
			pieceTypeProperties: {
				schema: {
					[PartType.Camera]: {
						// every type carries a label and a button type used for the button picker
						sourceLayerLabel: 'CAM',
						sourceLayerType: SourceLayerType.CAMERA,
						schema: JSONBlobStringify<JSONSchema>({
							$schema: 'https://json-schema.org/draft/2020-12/schema',
							type: 'object',
							properties: {
								variant: {
									type: 'string',
									title: 'Change to Camera on part:',
									enum: ['1', '2', '3', '4', '5'],
									tsEnumNames: ['Cam 1', 'Cam 2', 'Cam 3', 'Cam 4', 'Cam 5'],
								} as any,
							},
							required: ['variant'],
						}),
						defaultValue: {
							variant: '1',
						},
					},
					[PartType.Remote]: {
						sourceLayerLabel: 'EXT',
						sourceLayerType: SourceLayerType.REMOTE,
						schema: JSONBlobStringify<JSONSchema>({
							$schema: 'https://json-schema.org/draft/2020-12/schema',
							type: 'object',
							properties: {
								variant: {
									type: 'string',
									title: 'Change To External source on part:',
									enum: ['1', '2', '3', '4', '5'],
									tsEnumNames: ['Ext 1', 'Ext 2', 'Ext 3', 'Ext 4', 'Ext 5'],
								} as any,
							},
							required: ['variant'],
						}),
						defaultValue: {
							variant: '1',
						},
					},
				},
				currentValue: {
					type: String(rawPart.type),
					value: {
						//@ts-expect-error - rawPart.payload.input types not specified:
						variant: String(rawPart.payload.input || 2),
						...{},
					},
				},
			},
			globalProperties: {
				schema: JSONBlobStringify<JSONSchema>({
					$schema: 'https://json-schema.org/draft/2020-12/schema',
					title: 'Source schema for SPL Type',
					type: 'object',
					properties: {
						[BlueprintUserOperationTypes.LOCK_SEGMENT_NRCS_UPDATES]: {
							type: 'boolean',
							title: 'Lock Segment',
							'ui:displayType': 'switch',
						} as any, // note - get custom schema types here
					},
					required: [BlueprintUserOperationTypes.LOCK_SEGMENT_NRCS_UPDATES],
				}),
				currentValue: {
					[BlueprintUserOperationTypes.LOCK_SEGMENT_NRCS_UPDATES]:
						intermediateSegment.userEditStates?.[BlueprintUserOperationTypes.LOCK_PART_NRCS_UPDATES],
					disable: false,
				},
			},
		}

		return newPart
	})

	return {
		segment: {
			name: intermediateSegment.payload.name,
			userEditOperations: userEditOperationsOnSegment,
		},
		parts: parts,
	}
}
