import * as _ from 'underscore'

import { BlueprintConfig } from './config'
import { NotesContext, SourceLayerType } from 'tv-automation-sofie-blueprints-integration'

export function parseMapStr (context: NotesContext | undefined, str: string, canBeStrings: boolean): { id: number, val: any }[] {
	str = str.trim()

	const res: { id: number, val: number | string }[] = []

	const inputs = str.split(',')
	inputs.forEach(i => {
		if (i === '') return

		try {
			const p = i.split(':')
			if (p.length === 2) {
				const ind = parseInt(p[0], 10)
				const val = parseInt(p[1], 10)

				if (isNaN(ind)) throw new Error()

				if (!canBeStrings && !isNaN(val)) {
					res.push({ id: ind, val: parseInt(p[1], 10) })
					return
				} else if (canBeStrings && p[1]) {
					res.push({ id: ind, val: p[1] })
					return
				}
			}
		} catch (e) {
			// Ignore?
		}
		if (context) {
			context.warning('Invalid input map chunk: ' + i)
		}
	})

	return res
}

type SourceInfoType = SourceLayerType.CAMERA // | SourceLayerType.REMOTE
export interface SourceInfo {
	type: SourceInfoType
	id: number
	port: number
	ptzDevice?: string
}

export function parseSources (context: NotesContext | undefined, config: BlueprintConfig): SourceInfo[] {
	const kamInputMap: { id: number, val: number }[] = parseMapStr(context, config.studio.SourcesCam, false)

	const res: SourceInfo[] = []

	_.each(kamInputMap, kam => {
		res.push({
			type: SourceLayerType.CAMERA,
			id: kam.id,
			port: kam.val
		})
	})

	return res
}

export function findSourceInfo (sources: SourceInfo[], type: SourceInfoType, id: number | string): SourceInfo | undefined {
	if (typeof id !== 'number') {
		id = (id + '').toLowerCase()
		id = parseInt(id.replace(/\D/g, ''), 10) || 1
	}

	return _.find(sources, s => s.type === type && s.id === id)
}

export function findSourceInfoStrict (context: NotesContext, sources: SourceInfo[], type: SourceInfoType, id: number | string): SourceInfo | undefined {
	const source = findSourceInfo(sources, type, id)
	if (!source) {
		context.warning(`Invalid source "${id}" of type "${type}"`)
	}
	return source
}

export function findSourceByName (context: NotesContext, sources: SourceInfo[], name: string): SourceInfo | undefined {
	name = (name + '').toLowerCase()

	if (name.indexOf('k') === 0) {
		return findSourceInfoStrict(context, sources, SourceLayerType.CAMERA, name)
	}
	// if (name.indexOf('r') === 0) {
	// 	return findSourceInfoStrict(context, sources, SourceLayerType.REMOTE, name)
	// }

	context.warning(`Invalid source name "${name}"`)
	return undefined
}
