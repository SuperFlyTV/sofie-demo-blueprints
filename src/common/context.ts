import {
	BlueprintMappings,
	IBlueprintSegmentRundown,
	ISegmentUserContext,
	IShowStyleContext,
	PackageInfo,
} from '@sofie-automation/blueprints-integration'

export function isPartContext(context: IShowStyleContext): context is PartContext {
	return (context as PartContext).isPartContext === true
}

export class PartContext implements ISegmentUserContext {
	public readonly rundownId: string
	public readonly studioId: string
	public readonly rundown: IBlueprintSegmentRundown

	private baseContext: ISegmentUserContext
	private externalId: string

	public readonly isPartContext = true

	constructor(baseContext: ISegmentUserContext, externalId: string) {
		this.baseContext = baseContext
		this.externalId = externalId

		this.rundownId = baseContext.rundownId
		this.rundown = baseContext.rundown
		this.studioId = baseContext.studioId
	}

	public getPackageInfo(_packageId: string): PackageInfo.Any[] {
		return []
	}

	public async hackGetMediaObjectDuration(mediaId: string): Promise<number | undefined> {
		return this.baseContext.hackGetMediaObjectDuration(mediaId)
	}

	public getRuntimeArguments(_externalId: string): undefined {
		throw new Error('NOT SUPPORTED')
	}

	/** IShowStyleConfigContext */
	public getShowStyleConfig(): unknown {
		return this.baseContext.getShowStyleConfig()
	}
	public getShowStyleConfigRef(configKey: string): string {
		return this.baseContext.getShowStyleConfigRef(configKey)
	}

	/** IStudioContext */
	public getStudioMappings(): Readonly<BlueprintMappings> {
		return this.baseContext.getStudioMappings()
	}

	/** IStudioConfigContext */
	public getStudioConfig(): unknown {
		return this.baseContext.getStudioConfig()
	}
	public getStudioConfigRef(configKey: string): string {
		return this.baseContext.getStudioConfigRef(configKey)
	}

	/** IUserNotesContext */
	public notifyUserError(message: string, params?: { [key: string]: any }): void {
		return this.baseContext.notifyUserError(message, params, this.externalId)
	}
	public notifyUserWarning(message: string, params?: { [key: string]: any }): void {
		return this.baseContext.notifyUserWarning(message, params, this.externalId)
	}
	public notifyUserInfo(message: string, params?: { [key: string]: any }): void {
		return this.baseContext.notifyUserInfo(message, params, this.externalId)
	}

	/** ICommonContext */
	public getHashId(originString: string, originIsNotUnique?: boolean): string {
		return this.baseContext.getHashId(`${this.externalId}_${originString}`, originIsNotUnique)
	}
	public unhashId(hash: string): string {
		return this.baseContext.unhashId(hash)
	}

	/** Log a message to the sofie log with level 'debug' */
	public logDebug(message: string): void {
		return this.baseContext.logDebug(message)
	}
	/** Log a message to the sofie log with level 'info' */
	public logInfo(message: string): void {
		return this.baseContext.logInfo(message)
	}
	/** Log a message to the sofie log with level 'warn' */
	public logWarning(message: string): void {
		return this.baseContext.logWarning(message)
	}
	/** Log a message to the sofie log with level 'error' */
	public logError(message: string): void {
		return this.baseContext.logError(message)
	}
}
