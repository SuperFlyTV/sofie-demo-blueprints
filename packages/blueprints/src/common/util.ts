import {
	IBlueprintPiece,
	IRundownContext,
	IRundownUserContext,
	IShowStyleContext,
	IShowStyleUserContext,
	ITranslatableMessage,
	PieceLifespan,
} from '@sofie-automation/blueprints-integration'
import type { SetRequired } from 'type-fest'

export type ThisOrThat<T extends boolean, A, B> = T extends true ? A : B

export function literal<T>(o: T): T {
	return o
}

export function t(key: string, args?: { [k: string]: any }): ITranslatableMessage {
	return {
		key,
		args,
	}
}

export function createVirtualPiece<TPieceMetadata>(
	layer: string,
	outputLayer: string,
	start: number | IBlueprintPiece['enable'],
	lifespan: PieceLifespan,
	metadata: TPieceMetadata,
	mainPiece?: IBlueprintPiece<TPieceMetadata>
): SetRequired<IBlueprintPiece<TPieceMetadata>, 'privateData'> {
	return {
		name: '',
		externalId: mainPiece ? mainPiece.externalId : '-',
		enable:
			typeof start === 'number'
				? {
						start,
						duration: 0,
					}
				: start,
		sourceLayerId: layer,
		outputLayerId: outputLayer,
		lifespan,
		virtual: true,
		privateData: metadata,
		content: {
			timelineObjects: [],
		},
	}
}

export type OptionalExceptFor<T, TRequired extends keyof T> = Partial<T> & Pick<T, TRequired>

export function assertUnreachable(_never: never): never {
	throw new Error("Didn't expect to get here")
}

export function assertNever(_never: never): void {
	// Do nothing. This is a type guard
}

export function asRundownContext(context: IShowStyleContext): IRundownContext | undefined {
	if (Object.prototype.hasOwnProperty.call(context, 'rundown')) {
		return context as IRundownContext
	} else {
		return undefined
	}
}

export function asRundownUserContext(context: IShowStyleUserContext): IRundownUserContext | undefined {
	if (Object.prototype.hasOwnProperty.call(context, 'rundown')) {
		return context as unknown as IRundownUserContext
	} else {
		return undefined
	}
}

export function normalizeArray<T>(array: T[], indexKey: keyof T): { [indexKey: string]: T | undefined } {
	const normalizedObject: any = {}
	for (const item of array) {
		const key = item[indexKey]
		normalizedObject[key] = item
	}
	return normalizedObject as { [key: string]: T }
}

export function normalizeArrayToMap<T, K extends keyof T>(array: T[], indexKey: K): Map<T[K], T> {
	const normalizedObject = new Map<T[K], T>()
	for (const item of array) {
		const key = item[indexKey]
		normalizedObject.set(key, item)
	}
	return normalizedObject
}

/** Temporary helper to handle the 'now' value when we know we don't expect it to be there */
export function unwrapStart(value: number | 'now'): number {
	if (typeof value === 'number') return value
	throw new Error("Cannot unwrap start that is set to 'now'")
}

export function changeExtension(fileName: string, newExt: string): string {
	const pos = fileName.includes('.') ? fileName.lastIndexOf('.') : fileName.length
	const fileRoot = fileName.substring(0, pos)
	const output = `${fileRoot}.${newExt}`
	return output
}

export function stripExtension(fileName: string): string {
	const pos = fileName.includes('.') ? fileName.lastIndexOf('.') : fileName.length
	const fileRoot = fileName.substring(0, pos)
	return fileRoot
}
