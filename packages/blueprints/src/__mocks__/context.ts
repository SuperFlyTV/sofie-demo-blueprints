import {
	BlueprintMappings,
	ExtendedIngestRundown,
	IAsRunEventContext,
	IBlueprintAsRunLogEvent,
	IBlueprintExternalMessageQueueObj,
	IBlueprintPartDB,
	IBlueprintPartInstance,
	IBlueprintPieceInstance,
	IBlueprintRundownDB,
	IBlueprintSegmentDB,
	ICommonContext,
	IEventContext,
	IngestPart,
	IRundownContext,
	ISegmentUserContext,
	IShowStyleContext,
	IUserNotesContext,
} from '@sofie-automation/blueprints-integration'
import * as crypto from 'crypto'
import * as _ from 'underscore'

export function getHash(str: string): string {
	const hash = crypto.createHash('sha1')
	return hash.update(str).digest('base64').replace(/[+/=]/g, '_') // remove +/= from strings, because they cause troubles
}

export class CommonContext implements ICommonContext {
	private idPrefix = ''
	private hashI = 0
	private hashed: { [hash: string]: string } = {}

	constructor(idPrefix: string) {
		this.idPrefix = idPrefix
	}
	public logDebug(message: string): void {
		message // stop eslint complaining about unused arguments. The argument has to be there to implement the interface
	}
	public logInfo(message: string): void {
		message // stop eslint complaining about unused arguments. The argument has to be there to implement the interface
	}
	public logWarning(message: string): void {
		message // stop eslint complaining about unused arguments. The argument has to be there to implement the interface
	}
	public logError(message: string): void {
		message // stop eslint complaining about unused arguments. The argument has to be there to implement the interface
	}

	public getHashId(origin: string, isNotUnique?: boolean): string {
		if (isNotUnique) {
			origin = origin + '_' + this.hashI++
		}

		const id: string = getHash(this.idPrefix + '_' + origin.toString())
		this.hashed[id] = origin
		return id
	}
	public unhashId(hash: string): string {
		return this.hashed[hash] || hash
	}
}

export enum NoteType {
	WARNING = 1,
	ERROR = 2,
}

// copied from the core notes api
export interface ITranslatableMessage {
	/** the message key (we use literal strings in English as keys for now) */
	key: string
	/** arguments for the message template */
	args?: { [key: string]: any }
	/** namespace used */
	namespaces?: Array<string>
}

export interface PartNote {
	type: NoteType
	origin: {
		name: string
		roId?: string
		segmentId?: string
		partId?: string
		pieceId?: string
	}
	message: ITranslatableMessage
}

export class NotesContext extends CommonContext implements IUserNotesContext {
	public savedNotes: PartNote[] = []

	private contextName: string
	private rundownIdInner?: string
	private segmentId?: string
	private partId?: string

	constructor(contextName: string, rundownId?: string, segmentId?: string, partId?: string) {
		super(rundownId + (partId ? '_' + partId : segmentId ? '_' + segmentId : ''))
		this.contextName = contextName
		this.rundownIdInner = rundownId
		this.segmentId = segmentId
		this.partId = partId
	}
	notifyUserError(message: string, params?: { [key: string]: any }): void {
		this._pushNote(NoteType.ERROR, message, params)
	}
	notifyUserWarning(message: string, params?: { [key: string]: any }): void {
		this._pushNote(NoteType.WARNING, message, params)
	}

	public _getNotes(): PartNote[] {
		return this.savedNotes
	}

	private _pushNote(type: NoteType, message: string, params?: { [key: string]: any }): void {
		// console.log(message)
		this.savedNotes.push({
			type,
			origin: {
				name: this._getLoggerName(),
				roId: this.rundownIdInner,
				segmentId: this.segmentId,
				partId: this.partId,
			},
			message: {
				key: message,
				args: { ...params },
			},
		})
	}
	private _getLoggerName(): string {
		return this.contextName
	}
}

function flattenParametrizedString(message: string, params?: { [key: string]: any }): string {
	const re = /(\{\{[\w]*\}\})/gm
	for (const [key] of message.matchAll(re)) {
		message = message.replaceAll(`{{${key}}}`, params && params[key])
	}
	return message
}

export class LoggingNotesContext extends CommonContext implements IUserNotesContext {
	constructor(id?: string) {
		super(id || 'LoggingNotesContext')
	}

	/** Throw Error and display message to the user in the GUI */
	notifyUserError(message: string, params?: { [key: string]: any }): void {
		const parsedMessage = flattenParametrizedString(message, params)

		this.logError(parsedMessage)
		throw new Error(parsedMessage)
	}

	/** Save note, which will be displayed to the user in the GUI */
	notifyUserWarning(message: string, params?: { [key: string]: any }): void {
		this.logWarning(flattenParametrizedString(message, params))
	}
}

export class ShowStyleContext extends NotesContext implements IShowStyleContext {
	public studioConfig: unknown = {}
	public showStyleConfig: unknown = {}

	private mappingsDefaults: BlueprintMappings

	constructor(contextName: string, mappings: BlueprintMappings, rundownId?: string) {
		super(contextName, rundownId)
		this.mappingsDefaults = mappings
	}
	public getStudioConfig(): unknown {
		return this.studioConfig
	}
	public getStudioConfigRef(configKey: string): string {
		return 'studio.mock.' + configKey // just a placeholder
	}
	public getShowStyleConfig(): unknown {
		return this.showStyleConfig
	}
	public getShowStyleConfigRef(configKey: string): string {
		return 'showStyle.mock.' + configKey // just a placeholder
	}
	public getStudioMappings(): BlueprintMappings {
		return _.clone(this.mappingsDefaults)
	}
}

export class RundownContext extends ShowStyleContext implements ISegmentUserContext, IRundownContext {
	public rundownId: string
	public rundown: IBlueprintRundownDB

	constructor(rundown: IBlueprintRundownDB, mappings: BlueprintMappings, contextName?: string) {
		super(contextName || rundown.name, mappings, rundown._id)

		this.rundownId = rundown._id
		this.rundown = rundown
	}

	public getRuntimeArguments(_externalId: string): undefined {
		throw new Error('NOT SUPPORTED')
	}
}
export type SegmentContext = RundownContext

export class EventContext extends CommonContext implements IEventContext {
	// TDB: Certain actions that can be triggered in Core by the Blueprint

	getCurrentTime(): number {
		return Date.now()
	}
}

export class AsRunEventContext extends RundownContext implements IAsRunEventContext, EventContext {
	public asRunEvent: IBlueprintAsRunLogEvent

	public mockAsRunEvents: IBlueprintAsRunLogEvent[] = []
	public mockQueuedMessages: IBlueprintExternalMessageQueueObj[] = []

	public mockSegments: IBlueprintSegmentDB[] = []
	public mockParts: IBlueprintPartDB[] = []
	public mockPartInstances: IBlueprintPartInstance[] = []
	public mockPieceInstances: IBlueprintPieceInstance[] = []

	constructor(rundown: IBlueprintRundownDB, mappings: BlueprintMappings, asRunEvent: IBlueprintAsRunLogEvent) {
		super(rundown, mappings)
		this.asRunEvent = asRunEvent
	}
	public getCurrentTime(): number {
		return Date.now()
	}
	public getAllAsRunEvents(): IBlueprintAsRunLogEvent[] {
		return this.mockAsRunEvents
	}
	public getAllQueuedMessages(): IBlueprintExternalMessageQueueObj[] {
		return this.mockQueuedMessages
	}
	public getSegments(): IBlueprintSegmentDB[] {
		return this.mockSegments
	}
	public getSegment(id?: string): IBlueprintSegmentDB | undefined {
		return this.mockSegments.find((segment) => segment._id === (id || this.asRunEvent.segmentId))
	}
	public getParts(): IBlueprintPartDB[] {
		return this.mockParts
	}
	public getPartInstance(id?: string): IBlueprintPartInstance | undefined {
		return this.mockPartInstances.find((p) => p._id === (id || this.asRunEvent.partInstanceId))
	}
	public getPieceInstance(pieceInstanceId?: string): IBlueprintPieceInstance | undefined {
		return this.mockPieceInstances.find((p) => p._id === (pieceInstanceId || this.asRunEvent.pieceInstanceId))
	}
	public getPieceInstances(partInstanceId: string): IBlueprintPieceInstance[] {
		return this.mockPieceInstances.filter((p) => (p as any).partInstanceId === partInstanceId) // TODO - tidy up this?
	}
	/** Get the ingest data related to the rundown */
	public getIngestDataForRundown(): ExtendedIngestRundown | undefined {
		throw new Error('Removed')
	}
	public getIngestDataForPartInstance(_partInstance: IBlueprintPartInstance): IngestPart | undefined {
		throw new Error('Removed')
	}
	/** Get the ingest data related to a part */
	public getIngestDataForPart(_part: IBlueprintPartDB): IngestPart | undefined {
		throw new Error('Removed')
	}
	public formatDateAsTimecode(time: number): string {
		return 'dateTimecode_' + time
	}
	public formatDurationAsTimecode(time: number): string {
		return 'durationTimecode_' + time
	}
}
