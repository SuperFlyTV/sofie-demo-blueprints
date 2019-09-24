import * as _ from 'underscore'

import { NotesContext, SourceLayerType } from 'tv-automation-sofie-blueprints-integration'
import { literal } from '../../common/util'
import { StudioConfig } from './config'

export function parseMapStr(
	context: NotesContext | undefined,
	str: string,
	canBeStrings: boolean
): Array<{ id: number; val: any }> {
	str = str.trim()

	const res: Array<{ id: number; val: number | string }> = []

	const inputs = str.split(',')
	inputs.forEach(i => {
		if (i === '') {
			return
		}

		try {
			const p = i.split(':')
			if (p.length === 2) {
				const ind = parseInt(p[0], 10)
				const val = parseInt(p[1], 10)

				if (isNaN(ind)) {
					throw new Error()
				}

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

type SourceInfoType = SourceLayerType.CAMERA | SourceLayerType.REMOTE
export interface SourceInfo {
	type: SourceInfoType
	id: number
	port: number
	ptzDevice?: string
}

export function parseMediaPlayers(
	context: NotesContext | undefined,
	studioConfig: StudioConfig
): Array<{ id: number; val: number }> {
	return parseMapStr(context, studioConfig.ABMediaPlayers, false)
}

export function parseSources(context: NotesContext | undefined, studioConfig: StudioConfig): SourceInfo[] {
	const rmInputMap: Array<{ id: number; val: number }> = parseMapStr(context, studioConfig.SourcesRM, false)
	const kamInputMap: Array<{ id: number; val: number }> = parseMapStr(context, studioConfig.SourcesCam, false)

	const res: SourceInfo[] = []

	_.each(rmInputMap, rm => {
		res.push({
			type: SourceLayerType.REMOTE,
			id: rm.id,
			port: rm.val
		})
	})

	_.each(kamInputMap, kam => {
		res.push({
			type: SourceLayerType.CAMERA,
			id: kam.id,
			port: kam.val
		})
	})

	return res
}

export function FindSourceInfo(
	sources: SourceInfo[],
	type: SourceInfoType,
	id: number | string
): SourceInfo | undefined {
	if (typeof id !== 'number') {
		id = (id + '').toLowerCase()
		id = parseInt(id.replace(/\D/g, ''), 10) || 1
	}

	return _.find(sources, s => s.type === type && s.id === id)
}

export function FindSourceInfoStrict(
	context: NotesContext,
	sources: SourceInfo[],
	type: SourceInfoType,
	id: number | string
): SourceInfo | undefined {
	const source = FindSourceInfo(sources, type, id)
	if (!source) {
		context.warning(`Invalid source "${id}" of type "${type}"`)
	}
	return source
}

export function FindSourceByName(context: NotesContext, sources: SourceInfo[], name: string): SourceInfo | undefined {
	name = (name + '').toLowerCase()

	if (name.indexOf('k') === 0 || name.indexOf('c') === 0) {
		return FindSourceInfoStrict(context, sources, SourceLayerType.CAMERA, name)
	}
	if (name.indexOf('r') === 0) {
		return FindSourceInfoStrict(context, sources, SourceLayerType.REMOTE, name)
	}

	context.warning(`Invalid source name "${name}"`)
	return undefined
}

export function GetInputValue(context: NotesContext, sources: SourceInfo[], name: string): number {
	let input = 1000
	const source = FindSourceByName(context, sources, name)

	if (source !== undefined) {
		input = literal<SourceInfo>(source).port
	}

	return input
}
