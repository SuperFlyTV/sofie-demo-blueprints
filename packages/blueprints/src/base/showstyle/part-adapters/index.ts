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
	context.logDebug('Generating parts for intermediateSegment: ' + JSON.stringify(intermediateSegment, null, 2))
	// Create Segment UserEditOperations:
	const userEditOperationsOnSegment: UserEditingDefinitionAction[] = [
		{
			type: UserEditingType.ACTION,
			id: BlueprintUserOperationTypes.LOCK_SEGMENT_NRCS_UPDATES,
			label: t('Lock Segment for NRCS Updates'),
			// TODO: This could be a file on disk instead of data URL
			icon: `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPgogIDxyZWN0IHg9IjMiIHk9IjciIHdpZHRoPSIxMCIgaGVpZ2h0PSI3IiByeD0iMSIgcnk9IjEiIC8+CiAgPHBhdGggZD0iTTUgN1Y1YTMgMyAwIDAgMSA2IDB2MiIgLz4KPC9zdmc+`,
			isActive: intermediateSegment.userEditStates?.[BlueprintUserOperationTypes.LOCK_SEGMENT_NRCS_UPDATES],
		},
	]

	const parts = intermediateSegment.parts.map((rawPart): BlueprintResultPart => {
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
								valueOnVariant: {
									type: 'string',
									title: 'Change to Camera on part:',
									enum: ['1', '2', '3', '4', '5'],
									tsEnumNames: ['Cam 1', 'Cam 2', 'Cam 3', 'Cam 4', 'Cam 5'],
								} as any,
							},
							required: ['valueOnVariant'],
						}),
						defaultValue: {
							valueOnVariant: '2',
						},
					},
					[PartType.Remote]: {
						sourceLayerLabel: 'EXT',
						sourceLayerType: SourceLayerType.REMOTE,
						schema: JSONBlobStringify<JSONSchema>({
							$schema: 'https://json-schema.org/draft/2020-12/schema',
							type: 'object',
							properties: {
								valueOnVariant: {
									type: 'string',
									title: 'Change To External source on part:',
									enum: ['1', '2', '3', '4', '5'],
									tsEnumNames: ['Ext 1', 'Ext 2', 'Ext 3', 'Ext 4', 'Ext 5'],
								} as any,
							},
							required: ['valueOnVariant'],
						}),
						defaultValue: {
							// Here we need to get the camera number from the raw input:
							//@ts-expect-error - rawPart rawInput type depends on the type:
							valueOnVariant: String(rawPart.payload.input?.id || 2),
						},
					},
				},
				currentValue: {
					type: String(rawPart.type),
					value: {
						//@ts-expect-error - rawPart.payload.input types not specified:
						valueOnVariant: String(rawPart.payload.input?.id || 3),
					},
				},
			},
			// This is the global properties for the part - the lock is referencing the segment:
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
						intermediateSegment.userEditStates?.[BlueprintUserOperationTypes.LOCK_SEGMENT_NRCS_UPDATES],
				},
			},
		}

		return newPart
	})

	return {
		segment: {
			name: intermediateSegment.payload.name,
			userEditOperations: userEditOperationsOnSegment,
			userEditProperties: {
				// This is the global properties for the segment - the lock is referencing this segment:
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
							intermediateSegment.userEditStates?.[BlueprintUserOperationTypes.LOCK_SEGMENT_NRCS_UPDATES],
					},
				},
			},
		},
		parts: parts,
	}
}
