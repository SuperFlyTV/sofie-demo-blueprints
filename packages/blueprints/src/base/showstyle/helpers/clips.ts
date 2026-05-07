import {
	ExpectedPackage,
	IBlueprintAdLibPiece,
	ICommonContext,
	PieceLifespan,
	TSR,
} from '@sofie-automation/blueprints-integration'
import { ObjectType, SomeObject, VideoObject } from '../../../common/definitions/objects.js'
import { assertUnreachable, literal } from '../../../common/util.js'
import { SourceType, StudioConfig, VisionMixerDevice } from '../../studio/helpers/config.js'
import { CasparCGLayers } from '../../studio/layers.js'
import { getOutputLayerForSourceLayer, SourceLayer } from '../applyconfig/layers.js'
import { createVisionMixerObjects } from './visionMixer.js'
import { TimelineBlueprintExt } from '../../studio/customTypes.js'
import { InputConfig, ObsSourceConfig, VmixInputConfig } from '../../..//$schemas/generated/main-studio-config.js'
import { getOBSClipMediaPlayerSourceIds, getOBSEffectsMediaPlayerSourceIds } from '../../studio/helpers/obsSources.js'
import {
	getOBSInputAudioABPendingLayer,
	getOBSInputAudioLayer,
	getOBSInputMediaABPendingLayer,
	getOBSInputMediaLayer,
	getOBSInputSettingsABPendingLayer,
	getOBSInputSettingsLayer,
} from '../../studio/applyConfig/mappings/obs.js'

export interface ABSessionLabel {
	poolName: string
	sessionName: string
}

export function getOBSClipPlayerSourceIds(config: StudioConfig): string[] {
	if (config.visionMixer.type !== VisionMixerDevice.OBS) return []

	return getOBSClipMediaPlayerSourceIds(config)
}

export function getOBSEffectsPlayerSourceIds(config: StudioConfig): string[] {
	if (config.visionMixer.type !== VisionMixerDevice.OBS) return []

	const sourceIds = getOBSEffectsMediaPlayerSourceIds(config)
	return sourceIds.length > 0 ? sourceIds : getOBSClipPlayerSourceIds(config).slice(0, 1)
}

export function getClipExpectedPackageLayers(config: StudioConfig, sourceIds?: string[]): string[] {
	if (config.visionMixer.type === VisionMixerDevice.OBS) {
		const obsSourceIds = sourceIds || getOBSClipPlayerSourceIds(config)
		if (obsSourceIds.length === 0) return [getOBSInputMediaLayer('mediaplayer1')]
		return obsSourceIds.map((sourceId) => getOBSInputMediaLayer(sourceId))
	}

	return [CasparCGLayers.CasparCGClipPlayer1, CasparCGLayers.CasparCGClipPlayer2]
}

export interface ClipProps {
	fileName: string
	duration?: number
	sourceDuration?: number
}

interface CreateOBSClipPlayerObjectOptions {
	includeAudio?: boolean
}

export function parseClipProps(object: VideoObject): ClipProps {
	return {
		fileName: object.clipName,
		duration: object.duration,
	}
}

export function parseClipEditorProps(object: VideoObject): ClipProps {
	return {
		fileName: object.attributes.fileName as string,
		duration: object.duration * 1000,
		sourceDuration: object.attributes.sourceDuration as number,
	}
}

export interface ClipPlayerInput {
	input: number | string
	sourceId?: string
	sourceName?: string
}

function isAbsoluteFilePath(fileName: string): boolean {
	return fileName.startsWith('/') || /^[A-Za-z]:[\\/]/.test(fileName) || fileName.startsWith('\\\\')
}

function joinFilePath(basePath: string, relativePath: string): string {
	const normalizedBasePath = basePath.replace(/[\\/]+$/, '')
	const normalizedRelativePath = relativePath.replace(/^[\\/]+/, '')
	if (!normalizedBasePath) return normalizedRelativePath
	if (!normalizedRelativePath) return normalizedBasePath
	return `${normalizedBasePath}/${normalizedRelativePath}`
}

function resolveOBSLocalFilePath(config: StudioConfig, fileName: string): string {
	const obsMediaBasePath = config.obsMediaBasePath?.trim()

	if (!fileName || isAbsoluteFilePath(fileName) || !obsMediaBasePath) {
		return fileName
	}

	return joinFilePath(obsMediaBasePath, fileName)
}

export function getClipPlayerInput(config: StudioConfig): ClipPlayerInput | undefined {
	if (config.visionMixer.type === VisionMixerDevice.Atem) {
		const mediaplayerInput = Object.values<InputConfig>(config.atemSources).find(
			(s) => s.type === SourceType.MediaPlayer
		)

		return mediaplayerInput
	} else if (config.visionMixer.type === VisionMixerDevice.VMix) {
		const mediaplayerInput = Object.values<VmixInputConfig>(config.vmixSources).find(
			(s) => s.type === SourceType.MediaPlayer
		)

		return mediaplayerInput
	} else if (config.visionMixer.type === VisionMixerDevice.OBS) {
		const mediaplayerEntry = Object.entries<ObsSourceConfig>(config.obsSources).find(
			([sourceId, source]) =>
				source.type === SourceType.MediaPlayer && getOBSClipPlayerSourceIds(config).includes(sourceId)
		)

		return mediaplayerEntry
			? {
					input: mediaplayerEntry[1].sceneName,
					sourceId: mediaplayerEntry[0],
					sourceName: mediaplayerEntry[1].sourceName,
				}
			: undefined
	} else {
		assertUnreachable(config.visionMixer.type)
	}
}

export function createOBSClipPlayerObjects(
	config: StudioConfig,
	clipProps: ClipProps,
	start = 0,
	preferredSourceId?: string,
	abSession?: ABSessionLabel,
	options: CreateOBSClipPlayerObjectOptions = {}
): TimelineBlueprintExt<
	TSR.TimelineContentOBSInputSettings | TSR.TimelineContentOBSInputMedia | TSR.TimelineContentOBSInputAudio
>[] {
	const preferredSource = preferredSourceId
		? config.obsSources[preferredSourceId]
			? {
					input: config.obsSources[preferredSourceId].sceneName,
					sourceId: preferredSourceId,
					sourceName: config.obsSources[preferredSourceId].sourceName,
				}
			: undefined
		: undefined

	const clipPlayerInput = preferredSource || getClipPlayerInput(config)
	if (!clipPlayerInput?.sourceId) return []

	const settingsLayer = abSession
		? getOBSInputSettingsABPendingLayer()
		: getOBSInputSettingsLayer(clipPlayerInput.sourceId)
	const mediaLayer = abSession ? getOBSInputMediaABPendingLayer() : getOBSInputMediaLayer(clipPlayerInput.sourceId)
	const audioLayer = abSession ? getOBSInputAudioABPendingLayer() : getOBSInputAudioLayer(clipPlayerInput.sourceId)
	const includeAudio = options.includeAudio ?? true

	const timelineObjects: TimelineBlueprintExt<
		TSR.TimelineContentOBSInputSettings | TSR.TimelineContentOBSInputMedia | TSR.TimelineContentOBSInputAudio
	>[] = [
		literal<TimelineBlueprintExt<TSR.TimelineContentOBSInputSettings>>({
			id: '',
			enable: { start },
			layer: settingsLayer,
			content: {
				deviceType: TSR.DeviceType.OBS,
				type: TSR.TimelineContentTypeOBS.INPUT_SETTINGS,
				sourceType: 'ffmpeg_source',
				sourceSettings: {
					is_local_file: true,
					local_file: resolveOBSLocalFilePath(config, clipProps.fileName),
				},
			},
			priority: 1,
			...(abSession ? { abSessions: [abSession] } : {}),
		}),
		literal<TimelineBlueprintExt<TSR.TimelineContentOBSInputMedia>>({
			id: '',
			enable: { start },
			layer: mediaLayer,
			content: {
				deviceType: TSR.DeviceType.OBS,
				type: TSR.TimelineContentTypeOBS.INPUT_MEDIA,
				seek: 0,
				state: 'paused',
			},
			keyframes: [
				{
					id: '',
					enable: { start: 0 },
					content: { state: 'playing' },
				},
			],
			priority: 1,
			...(abSession ? { abSessions: [abSession] } : {}),
		}),
	]

	if (includeAudio) {
		timelineObjects.push(
			literal<TimelineBlueprintExt<TSR.TimelineContentOBSInputAudio>>({
				id: '',
				enable: { start },
				layer: audioLayer,
				content: {
					deviceType: TSR.DeviceType.OBS,
					type: TSR.TimelineContentTypeOBS.INPUT_AUDIO,
					mute: false,
				},
				priority: 1,
				...(abSession ? { abSessions: [abSession] } : {}),
			})
		)
	}

	return timelineObjects
}

export function createOBSEffectsPlayerObjects(
	config: StudioConfig,
	clipProps: ClipProps,
	start = 0
): TimelineBlueprintExt[] {
	const effectsSourceId = getOBSEffectsPlayerSourceIds(config)[0]
	if (!effectsSourceId) return []

	return createOBSClipPlayerObjects(config, clipProps, start, effectsSourceId, undefined, { includeAudio: false })
}

export function createOBSBrowserSourceObjects(
	config: StudioConfig,
	url: string,
	start = 0,
	preferredSourceId: string = 'fullscreenBrowser'
): TimelineBlueprintExt<TSR.TimelineContentOBSInputSettings>[] {
	const browserSource = config.obsSources[preferredSourceId]
	if (!browserSource?.sourceName) return []

	return [
		literal<TimelineBlueprintExt<TSR.TimelineContentOBSInputSettings>>({
			id: '',
			enable: { start },
			layer: getOBSInputSettingsLayer(preferredSourceId),
			content: {
				deviceType: TSR.DeviceType.OBS,
				type: TSR.TimelineContentTypeOBS.INPUT_SETTINGS,
				sourceType: 'browser_source',
				sourceSettings: {
					url,
				} as any,
			},
			priority: 1,
		}),
	]
}

export function clipToAdlib(
	context: ICommonContext,
	config: StudioConfig,
	clipObject: VideoObject
): IBlueprintAdLibPiece {
	const props = parseClipProps(clipObject)
	const visionMixerInput = getClipPlayerInput(config)
	const mediaObjects =
		config.visionMixer.type === VisionMixerDevice.OBS
			? createOBSClipPlayerObjects(config, props, 0, undefined, {
					poolName: 'clip',
					sessionName: clipObject.id,
				})
			: [
					literal<TimelineBlueprintExt<TSR.TimelineContentCCGMedia>>({
						id: '',
						enable: { start: 0 },
						layer: CasparCGLayers.CasparCGClipPlayerAbPending,
						content: {
							deviceType: TSR.DeviceType.CASPARCG,
							type: TSR.TimelineContentTypeCasparCg.MEDIA,

							file: props.fileName,
						},
						priority: 1,
						abSessions: [
							{
								poolName: 'clip',
								sessionName: clipObject.id,
							},
						],
					}),
				]

	return literal<IBlueprintAdLibPiece>({
		_rank: 0,
		externalId: clipObject.id,
		name: `${props.fileName || 'Missing file name'}`,
		lifespan: PieceLifespan.WithinPart,
		sourceLayerId: SourceLayer.VO,
		outputLayerId: getOutputLayerForSourceLayer(SourceLayer.VO),
		abSessions: [
			{
				sessionName: clipObject.id,
				poolName: 'clip',
			},
		],
		expectedPackages: [
			literal<ExpectedPackage.ExpectedPackageMediaFile>({
				_id: context.getHashId(props.fileName, true),
				layers: getClipExpectedPackageLayers(config),
				type: ExpectedPackage.PackageType.MEDIA_FILE,
				content: {
					filePath: props.fileName,
				},
				version: {},
				contentVersionHash: '',
				sources: [],
				sideEffect: {},
			}),
		],
		content: {
			fileName: props.fileName,

			timelineObjects: [
				...createVisionMixerObjects(config, visionMixerInput?.input || 0, config.casparcgLatency, 40, undefined, {
					poolName: 'clip',
					sessionName: clipObject.id,
				}),
				...mediaObjects,
			],
		},
	})
}

export function parseClipsFromObjects(
	context: ICommonContext,
	config: StudioConfig,
	objects: SomeObject[]
): IBlueprintAdLibPiece[] {
	const clips = objects.filter((o): o is VideoObject => o.objectType === ObjectType.Video)

	return clips.map((o) => clipToAdlib(context, config, o))
}
