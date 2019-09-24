import * as crypto from 'crypto'
import * as _ from 'underscore'

import {
	BlueprintMappings,
	BlueprintRuntimeArguments,
	ConfigItemValue,
	IBlueprintRundownDB,
	ICommonContext,
	NotesContext as INotesContext,
	SegmentContext as ISegmentContext,
	ShowStyleContext as IShowStyleContext
} from 'tv-automation-sofie-blueprints-integration'
import mappingsDefaults from '../tv2_afvd_showstyle/migrations/mappings-defaults'

export function getHash(str: string): string {
	const hash = crypto.createHash('sha1')
	return hash
		.update(str)
		.digest('base64')
		.replace(/[\+\/\=]/g, '_') // remove +/= from strings, because they cause troubles
}

export class CommonContext implements ICommonContext {
	private _idPrefix: string = ''
	private hashI = 0
	private hashed: { [hash: string]: string } = {}

	constructor(idPrefix: string) {
		this._idPrefix = idPrefix
	}
	public getHashId(str?: any) {
		if (!str) {
			str = 'hash' + this.hashI++
		}

		let id
		id = getHash(this._idPrefix + '_' + str.toString())
		this.hashed[id] = str
		return id
		// return Random.id()
	}
	public unhashId(hash: string): string {
		return this.hashed[hash] || hash
	}
}
export enum NoteType {
	WARNING = 1,
	ERROR = 2
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
	message: string
}

// tslint:disable-next-line: max-classes-per-file
export class NotesContext extends CommonContext implements INotesContext {
	private _contextName: string
	private _rundownId?: string
	private _segmentId?: string
	private _partId?: string

	private savedNotes: PartNote[] = []

	constructor(contextName: string, rundownId?: string, segmentId?: string, partId?: string) {
		super(rundownId + (partId ? '_' + partId : segmentId ? '_' + segmentId : ''))
		this._contextName = contextName
		this._rundownId = rundownId
		this._segmentId = segmentId
		this._partId = partId
	}
	/** Throw Error and display message to the user in the GUI */
	public error(message: string) {
		// logger.error('Error from blueprint: ' + message)
		this._pushNote(NoteType.ERROR, message)
		throw new Error(message)
	}
	/** Save note, which will be displayed to the user in the GUI */
	public warning(message: string) {
		this._pushNote(NoteType.WARNING, message)
	}
	public getNotes() {
		return this.savedNotes
	}
	private _pushNote(type: NoteType, message: string) {
		// console.log(message)
		this.savedNotes.push({
			type,
			origin: {
				name: this._getLoggerName(),
				roId: this._rundownId,
				segmentId: this._segmentId,
				partId: this._partId
			},
			message
		})
	}
	private _getLoggerName() {
		return this._contextName
	}
}

// tslint:disable-next-line: max-classes-per-file
export class ShowStyleContext extends NotesContext implements IShowStyleContext {
	public studioConfig: { [key: string]: ConfigItemValue } = {}
	public showStyleConfig: { [key: string]: ConfigItemValue } = {}

	constructor(contextName: string, rundownId?: string) {
		super(contextName, rundownId)
	}
	public getStudioConfig(): { [key: string]: ConfigItemValue } {
		return this.studioConfig
	}
	public getStudioConfigRef(configKey: string): string {
		return 'studio.mock.' + configKey // just a placeholder
	}
	public getShowStyleConfig(): { [key: string]: ConfigItemValue } {
		return this.showStyleConfig
	}
	public getShowStyleConfigRef(configKey: string): string {
		return 'showStyle.mock.' + configKey // just a placeholder
	}
	public getStudioMappings(): BlueprintMappings {
		return _.clone(mappingsDefaults)
	}
}

// tslint:disable-next-line: max-classes-per-file
export class SegmentContext extends ShowStyleContext implements ISegmentContext {
	public rundownId: string
	public rundown: IBlueprintRundownDB

	public runtimeArguments: { [key: string]: BlueprintRuntimeArguments } = {}

	constructor(rundown: IBlueprintRundownDB, contextName?: string) {
		super(contextName || rundown.name, rundown._id)

		this.rundownId = rundown._id
		this.rundown = rundown
	}

	public getRuntimeArguments(externalId: string): BlueprintRuntimeArguments | undefined {
		return this.runtimeArguments[externalId]
	}
}

// export class EventContext extends CommonContext implements IEventContext {
// 	// TDB: Certain actions that can be triggered in Core by the Blueprint
// }

// export class AsRunEventContext extends RunningOrderContext implements IAsRunEventContext {

// 	public asRunEvent: AsRunLogEvent

// 	public mockAsRunEvents: AsRunLogEvent[]
// 	public mockSegments: Segment[]
// 	public mockRoStory?: MOS.IMOSRunningOrder
// 	public mockSegmentLineStories: {[id: string]: MOS.IMOSROFullStory} = {}

// 	constructor (runningOrder: RunningOrder, asRunEvent: AsRunLogEvent) {
// 		super(runningOrder)
// 		this.asRunEvent = asRunEvent
// 	}
// 	getAllAsRunEvents (): Array<AsRunLogEvent> {
// 		return this.mockAsRunEvents
// 	}
// 	getSegments (): Array<Segment> {
// 		return this.mockSegments
// 	}
// 	/** Get the segmentLine related to this AsRunEvent */
// 	getSegment (id?: string): Segment | undefined {
// 		return _.find(this.mockSegments, segment => segment._id === (id || this.asRunEvent.segmentId))
// 	}
// 	getSegmentLines (): Array<SegmentLine> {
// 		return super.getSegmentLines()
// 	}
// 	/** Get the segmentLine related to this AsRunEvent */
// 	getSegmentLine (id?: string): SegmentLine | undefined {
// 		return _.find(super.getSegmentLines(), sl => sl._id === (id || this.asRunEvent.segmentLineId))
// 	}
// 	getSegmentLineItem (segmentLineItemId?: string): IBlueprintPiece | undefined {
// 		return _.find(super.getSegmentLinesItems(), sli => sli._id === (segmentLineItemId || this.asRunEvent.segmentLineItemId))
// 	}
// 	getSegmentLineItems (segmentLineId: string): Array<IBlueprintPiece> {
// 		return _.filter(super.getSegmentLinesItems(), sli => sli.segmentLineId === segmentLineId)
// 	}
// 	/** Get the mos story related to a segmentLine */
// 	getStoryForSegmentLine (segmentLine: SegmentLine): MOS.IMOSROFullStory {
// 		return this.mockSegmentLineStories[segmentLine._id]
// 	}
// 	/** Get the mos story related to the runningOrder */
// 	getStoryForRunningOrder (): MOS.IMOSRunningOrder {
// 		return this.mockRoStory || {
// 			ID: new MOS.MosString128('ID'),
// 			Slug: new MOS.MosString128('Slug'),
// 			Stories: []
// 		}
// 	}
// 	formatDateAsTimecode (time: number): string {
// 		return 'dateTimecode_' + time
// 	}
// 	formatDurationAsTimecode (time: number): string {
// 		return 'durationTimecode_' + time
// 	}
// }
