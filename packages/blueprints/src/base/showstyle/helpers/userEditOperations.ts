import {
	DefaultUserOperationsTypes,
	UserEditingType,
	UserEditingDefinition,
} from '@sofie-automation/blueprints-integration'

/**
 * Creates standard user edit operations for pieces that support retiming
 * @returns Array of user edit operations including retime functionality
 */
export function createPieceUserEditOperations(): UserEditingDefinition[] {
	return [
		{
			type: UserEditingType.SOFIE,
			id: DefaultUserOperationsTypes.RETIME_PIECE,
			limitToCurrentPart: true,
		},
	]
}
