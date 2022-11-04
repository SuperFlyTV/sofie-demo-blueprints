import { literal } from '../../common/util'

export interface Variant {
	[key: string]: {
		name: string
	}
}

export const variants = literal<Variant>({})
