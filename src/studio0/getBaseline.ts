import { BlueprintResultBaseline, IStudioContext } from '@sofie-automation/blueprints-integration'

export function getBaseline(_context: IStudioContext): BlueprintResultBaseline {
	return {
		timelineObjects: [],
		expectedPackages: [],
	}
}
