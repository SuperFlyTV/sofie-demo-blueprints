import { AtemTransitionSettings } from 'timeline-state-resolver-types'
import { PartDefinition } from '../inewsConversion/converters/ParseBody'
import { TimeFromFrames } from '../parts/time/frameTime'

export function TransitionSettings(part: PartDefinition): AtemTransitionSettings {
	if (part.transition && part.transition.duration) {
		if (part.transition.style === 'WIPE') {
			return {
				wipe: {
					rate: TimeFromFrames(part.transition.duration)
				}
			}
		}
		return {
			mix: {
				rate: TimeFromFrames(part.transition.duration)
			}
		}
	}
	return {}
}
