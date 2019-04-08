import * as _ from 'underscore'
import * as crypto from 'crypto'

import {
	IBlueprintRunningOrder,
	BlueprintRuntimeArguments,
	IMessageBlueprintSegmentLine,
	ConfigItemValue,
	ICommonContext,
	NotesContext as INotesContext,
	RunningOrderContext as IRunningOrderContext,
	SegmentLineContext as ISegmentLineContext,
	SegmentContext as ISegmentContext,
	EventContext as IEventContext,
	AsRunEventContext as IAsRunEventContext,
	IBlueprintSegment,
	MOS,
	IBlueprintAsRunLogEvent,
	IBlueprintSegmentLineItem
} from 'tv-automation-sofie-blueprints-integration'

export function getHash (str: string): string {
	const hash = crypto.createHash('sha1')
	return hash.update(str).digest('base64').replace(/[\+\/\=]/g, '_') // remove +/= from strings, because they cause troubles
}

type Segment = IBlueprintSegment
type SegmentLine = IMessageBlueprintSegmentLine
type RunningOrder = IBlueprintRunningOrder
type AsRunLogEvent = IBlueprintAsRunLogEvent
export class CommonContext implements ICommonContext {

	private _idPrefix: string = ''
	private hashI = 0
	private hashed: {[hash: string]: string} = {}

	constructor (idPrefix: string) {
		this._idPrefix = idPrefix
	}
	getHashId (str?: any) {

		if (!str) str = 'hash' + (this.hashI++)

		let id
		id = getHash(
			this._idPrefix + '_' +
			str.toString()
		)
		this.hashed[id] = str
		return id
		// return Random.id()
	}
	unhashId (hash: string): string {
		return this.hashed[hash] || hash
	}
}
export enum SegmentLineNoteType {
	WARNING = 1,
	ERROR = 2
}
export interface SegmentLineNote {
	type: SegmentLineNoteType,
	origin: {
		name: string,
		roId?: string,
		segmentId?: string,
		segmentLineId?: string,
		segmentLineItemId?: string
	},
	message: string

}
export class NotesContext extends CommonContext implements INotesContext {

	private _runningOrderId: string
	private _contextName: string
	private _segmentId?: string
	private _segmentLineId?: string

	private savedNotes: Array<SegmentLineNote> = []

	constructor (
		contextName: string,
		runningOrderId: string,
		segmentId?: string,
		segmentLineId?: string
	) {
		super(
			runningOrderId +
			(
				segmentLineId ? '_' + segmentLineId :
				(
					segmentId ? '_' + segmentId : ''
				)
			)
		)
		this._contextName		= contextName
		this._runningOrderId	= runningOrderId
		this._segmentId			= segmentId
		this._segmentLineId		= segmentLineId

	}
	/** Throw Error and display message to the user in the GUI */
	error (message: string) {
		// logger.error('Error from blueprint: ' + message)
		this._pushNote(
			SegmentLineNoteType.ERROR,
			message
		)
		throw new Error(message)
	}
	/** Save note, which will be displayed to the user in the GUI */
	warning (message: string) {
		this._pushNote(
			SegmentLineNoteType.WARNING,
			message
		)
	}
	getNotes () {
		return this.savedNotes
	}
	private _pushNote (type: SegmentLineNoteType, message: string) {
		// console.log(message)
		this.savedNotes.push({
			type: type,
			origin: {
				name: this._getLoggerName(),
				roId: this._runningOrderId,
				segmentId: this._segmentId,
				segmentLineId: this._segmentLineId
			},
			message: message
		})
	}
	private _getLoggerName () {
		return this._contextName

	}
}
export class RunningOrderContext extends NotesContext implements IRunningOrderContext {
	runningOrderId: string
	runningOrder: IBlueprintRunningOrder

	mockSegmentLines: Array<SegmentLine>
	mockSegmentLineItems: Array<IBlueprintSegmentLineItem>

	studioConfig: {[key: string]: ConfigItemValue} = {}
	showStyleConfig: {[key: string]: ConfigItemValue} = {}

	constructor (runningOrder: IBlueprintRunningOrder, contextName?: string) {
		super(contextName || runningOrder.name, runningOrder._id)

		this.runningOrderId = runningOrder._id
		this.runningOrder = runningOrder
	}
	getStudioConfig (): {[key: string]: ConfigItemValue} {
		return this.studioConfig
	}
	getStudioConfigRef (configKey: string): string {
		return 'studio.mock.' + configKey // just a placeholder
	}
	getShowStyleConfig (): {[key: string]: ConfigItemValue} {
		return this.showStyleConfig
	}
	getShowStyleConfigRef (configKey: string): string {
		return 'showStyle.mock.' + configKey // just a placeholder
	}
	getSegmentLines (): Array<SegmentLine> {
		return this.mockSegmentLines
	}
	getSegmentLinesItems (): Array<IBlueprintSegmentLineItem> {
		return this.mockSegmentLineItems
	}
}
export class SegmentContext extends RunningOrderContext implements ISegmentContext {
	readonly segment: Segment
	constructor (runningOrder: RunningOrder, segment: Segment) {
		super(runningOrder)
		this.segment = segment
	}
	getSegmentLines (): Array<SegmentLine> {
		return super.getSegmentLines().filter((sl: SegmentLine) => sl.segmentId === this.segment._id)
	}
}

export class SegmentLineContext extends RunningOrderContext implements ISegmentLineContext {
	readonly segmentLine: SegmentLine
	constructor (runningOrder: RunningOrder, segmentLine: SegmentLine, story?: MOS.IMOSStory) {
		super(runningOrder, ((story ? story.Slug : '') || segmentLine.mosId) + '')

		this.segmentLine = segmentLine

	}
	getRuntimeArguments (): BlueprintRuntimeArguments {
		return {}
	}
	getSegmentLineIndex (): number {
		return this.getSegmentLines().findIndex((sl: SegmentLine) => sl._id === this.segmentLine._id)
	}
	/** return segmentLines in this segment */
	getSegmentLines (): Array<SegmentLine> {
		return super.getSegmentLines().filter((sl: SegmentLine) => sl.segmentId === this.segmentLine.segmentId)
	}
	/** Return true if segmentLine is the first in the Segment */
	getIsFirstSegmentLine (): boolean {
		let sls = this.getSegmentLines()
		let first = sls[0]
		return (first && first._id === this.segmentLine._id)
	}
	/** Return true if segmentLine is the false in the Segment */
	getIsLastSegmentLine (): boolean {
		let sls = this.getSegmentLines()
		if (sls.length) {
			let last = sls[sls.length - 1]
			return (last && last._id === this.segmentLine._id)
		}
		return false
	}
}

export class EventContext extends CommonContext implements IEventContext {
	// TDB: Certain actions that can be triggered in Core by the Blueprint
}

export class AsRunEventContext extends RunningOrderContext implements IAsRunEventContext {

	public asRunEvent: AsRunLogEvent

	public mockAsRunEvents: AsRunLogEvent[]
	public mockSegments: Segment[]
	public mockRoStory?: MOS.IMOSRunningOrder
	public mockSegmentLineStories: {[id: string]: MOS.IMOSROFullStory} = {}

	constructor (runningOrder: RunningOrder, asRunEvent: AsRunLogEvent) {
		super(runningOrder)
		this.asRunEvent = asRunEvent
	}
	getAllAsRunEvents (): Array<AsRunLogEvent> {
		return this.mockAsRunEvents
	}
	getSegments (): Array<Segment> {
		return this.mockSegments
	}
	/** Get the segmentLine related to this AsRunEvent */
	getSegment (id?: string): Segment | undefined {
		return _.find(this.mockSegments, segment => segment._id === (id || this.asRunEvent.segmentId))
	}
	getSegmentLines (): Array<SegmentLine> {
		return super.getSegmentLines()
	}
	/** Get the segmentLine related to this AsRunEvent */
	getSegmentLine (id?: string): SegmentLine | undefined {
		return _.find(super.getSegmentLines(), sl => sl._id === (id || this.asRunEvent.segmentLineId))
	}
	getSegmentLineItem (segmentLineItemId?: string): IBlueprintSegmentLineItem | undefined {
		return _.find(super.getSegmentLinesItems(), sli => sli._id === (segmentLineItemId || this.asRunEvent.segmentLineItemId))
	}
	getSegmentLineItems (segmentLineId: string): Array<IBlueprintSegmentLineItem> {
		return _.filter(super.getSegmentLinesItems(), sli => sli.segmentLineId === segmentLineId)
	}
	/** Get the mos story related to a segmentLine */
	getStoryForSegmentLine (segmentLine: SegmentLine): MOS.IMOSROFullStory {
		return this.mockSegmentLineStories[segmentLine._id]
	}
	/** Get the mos story related to the runningOrder */
	getStoryForRunningOrder (): MOS.IMOSRunningOrder {
		return this.mockRoStory || {
			ID: new MOS.MosString128('ID'),
			Slug: new MOS.MosString128('Slug'),
			Stories: []
		}
	}
	formatDateAsTimecode (time: number): string {
		return 'dateTimecode_' + time
	}
	formatDurationAsTimecode (time: number): string {
		return 'durationTimecode_' + time
	}
}
