import { AtemTransitionStyle } from 'timeline-state-resolver-types'

export function TransitionFromString(str: string): AtemTransitionStyle {
	if (str === 'MIX') {
		return AtemTransitionStyle.MIX
	} else if (str === 'DIP') {
		return AtemTransitionStyle.DIP
	} else if (str === 'WIPE') {
		return AtemTransitionStyle.WIPE
	} else if (str === 'STING') {
		return AtemTransitionStyle.STING
	}

	return AtemTransitionStyle.CUT
}
