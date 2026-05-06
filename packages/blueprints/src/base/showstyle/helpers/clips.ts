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
import { getOBSInputMediaLayer, getOBSInputSettingsLayer } from '../../studio/applyConfig/mappings/obs.js'

export interface ClipProps {
	fileName: string
	duration?: number
	sourceDuration?: number
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
			([, source]) => source.type === SourceType.MediaPlayer
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
	preferredSourceId?: string
): TimelineBlueprintExt<TSR.TimelineContentOBSInputSettings | TSR.TimelineContentOBSInputMedia>[] {
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

	return [
		literal<TimelineBlueprintExt<TSR.TimelineContentOBSInputSettings>>({
			id: '',
			enable: { start },
			layer: getOBSInputSettingsLayer(clipPlayerInput.sourceId),
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
		}),
		literal<TimelineBlueprintExt<TSR.TimelineContentOBSInputMedia>>({
			id: '',
			enable: { start },
			layer: getOBSInputMediaLayer(clipPlayerInput.sourceId),
			content: {
				deviceType: TSR.DeviceType.OBS,
				type: TSR.TimelineContentTypeOBS.INPUT_MEDIA,
				seek: 0,
				state: 'playing',
			},
			priority: 1,
		}),
	]
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
			? createOBSClipPlayerObjects(config, props)
			: [
					literal<TimelineBlueprintExt<TSR.TimelineContentCCGMedia>>({
						id: '',
						enable: { start: 0 },
						layer: CasparCGLayers.CasparCGClipPlayer1,
						content: {
							deviceType: TSR.DeviceType.CASPARCG,
							type: TSR.TimelineContentTypeCasparCg.MEDIA,

							file: props.fileName,
						},
						priority: 1,
					}),
				]

	return literal<IBlueprintAdLibPiece>({
		_rank: 0,
		externalId: clipObject.id,
		name: `${props.fileName || 'Missing file name'}`,
		lifespan: PieceLifespan.WithinPart,
		sourceLayerId: SourceLayer.VO,
		outputLayerId: getOutputLayerForSourceLayer(SourceLayer.VO),
		expectedPackages: [
			literal<ExpectedPackage.ExpectedPackageMediaFile>({
				_id: context.getHashId(props.fileName, true),
				layers: [CasparCGLayers.CasparCGClipPlayer1],
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
				...createVisionMixerObjects(config, visionMixerInput?.input || 0, config.casparcgLatency),
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
