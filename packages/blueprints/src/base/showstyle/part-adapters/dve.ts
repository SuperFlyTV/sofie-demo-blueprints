import { BlueprintResultPart, IBlueprintPiece, PieceLifespan, TSR } from '@sofie-automation/blueprints-integration'
import { PartContext } from '../../../common/context.js'
import { assertUnreachable, literal } from '../../../common/util.js'
import { AudioSourceType, SourceType, VisionMixerDevice } from '../../studio/helpers/config.js'
import { AtemLayers, VMixLayers } from '../../studio/layers.js'
import { DVEProps, PartProps } from '../definitions/index.js'
import { getAudioPrimaryObject } from '../helpers/audio.js'
import { getClipPlayerInput, parseClipsFromObjects } from '../helpers/clips.js'
import { dveLayoutToContent, parseSuperSourceLayout, parseSuperSourceProps } from '../helpers/dve.js'
import { parseGraphicsFromObjects } from '../helpers/graphics.js'
import { createScriptPiece } from '../helpers/script.js'
import { getSourceInfoFromRaw } from '../helpers/sources.js'
import { createVisionMixerObjects } from '../helpers/visionMixer.js'
import { getOutputLayerForSourceLayer, SourceLayer } from '../applyconfig/layers.js'
import { TimelineBlueprintExt } from '../../studio/customTypes.js'
import { VmixInputConfig } from '../../../$schemas/generated/main-studio-config.js'
import { parseConfig } from '../helpers/config.js'

const SUPER_SOURCE_LATENCY = 80
const SUPER_SOURCE_INPUT = 6000

export function generateDVEPart(context: PartContext, part: PartProps<DVEProps>): BlueprintResultPart {
	const config = parseConfig(context).studio
	// const sourceInfo = getSourceInfoFromRaw(config, part.payload.input1)

	context.logDebug(JSON.stringify(part, null, 2))

	const layout = parseSuperSourceLayout(context, part.payload)
	const boxes: TSR.SuperSourceBox[] = part.payload.inputs.map((input, i) => {
		let source = undefined
		if ('fileName' in input) {
			source = getClipPlayerInput(config)
		} else {
			source = getSourceInfoFromRaw(config, input)
		}
		return {
			...layout[i],
			source: source?.input || 0,
		}
	})

	const audioTlObj = getAudioPrimaryObject(
		config,
		part.payload.inputs
			.map((input) => {
				if ('fileName' in input) {
					return {
						type: AudioSourceType.Playback,
						index: 0, // whihc player?
					}
				} else if (input.type === SourceType.Camera) {
					return {
						type: AudioSourceType.Host, // all hosts?
						index: 0,
					}
				} else if (input.type === SourceType.Remote) {
					return {
						type: AudioSourceType.Remote,
						index: input.id - 1,
					}
				}
				return undefined
			})
			.filter<any>((p): p is any => p !== undefined)
	)

	const vmixDVEInput =
		Object.values<VmixInputConfig>(config.vmixSources).find((source) => source.type === SourceType.MultiView)?.input ??
		-1
	const dvePieceTimelineObjects: TimelineBlueprintExt[] = [
		...createVisionMixerObjects(
			config,
			config.visionMixer.type === VisionMixerDevice.Atem ? SUPER_SOURCE_INPUT : vmixDVEInput,
			SUPER_SOURCE_LATENCY
		),
		audioTlObj,
	]
	if (config.visionMixer.type === VisionMixerDevice.Atem) {
		dvePieceTimelineObjects.push(
			literal<TimelineBlueprintExt<TSR.TimelineContentAtemSsrcProps>>({
				id: '',
				enable: { while: 1 },
				priority: 1,
				layer: AtemLayers.AtemSuperSourceProps,
				content: {
					deviceType: TSR.DeviceType.ATEM,
					type: TSR.TimelineContentTypeAtem.SSRCPROPS,
					ssrcProps: parseSuperSourceProps(context, part.payload),
				},
			}),

			literal<TimelineBlueprintExt<TSR.TimelineContentAtemSsrc>>({
				id: '',
				enable: { start: 0 },
				priority: 1,
				layer: AtemLayers.AtemSuperSourceBoxes,
				content: {
					deviceType: TSR.DeviceType.ATEM,
					type: TSR.TimelineContentTypeAtem.SSRC,

					ssrc: {
						boxes,
					},
				},
			})
		)
	} else if (config.visionMixer.type === VisionMixerDevice.VMix) {
		dvePieceTimelineObjects.push(
			literal<TimelineBlueprintExt<TSR.TimelineContentVMixInput>>({
				id: '',
				enable: { start: 0 },
				priority: 1,
				layer: VMixLayers.VMixDVEMultiView,
				content: {
					deviceType: TSR.DeviceType.VMIX,
					type: TSR.TimelineContentTypeVMix.INPUT,
					overlays: {
						1: boxes[0]?.source ?? -1,
						2: boxes[1]?.source ?? -1,
					},
				},
			})
		)
	} else {
		assertUnreachable(config.visionMixer.type)
	}

	const dvePiece: IBlueprintPiece = {
		enable: {
			start: 0,
		},
		externalId: part.payload.externalId,
		name: `DVE`, // TODO
		lifespan: PieceLifespan.WithinPart,
		sourceLayerId: SourceLayer.DVE,
		outputLayerId: getOutputLayerForSourceLayer(SourceLayer.DVE),
		prerollDuration: SUPER_SOURCE_LATENCY,
		content: {
			...dveLayoutToContent(config, { boxes }, part.payload.inputs),
			timelineObjects: dvePieceTimelineObjects,
		},
	}

	const retainPieceTimelineObjects: TimelineBlueprintExt[] = []
	if (config.visionMixer.type === VisionMixerDevice.Atem) {
		retainPieceTimelineObjects.push(
			literal<TimelineBlueprintExt<TSR.TimelineContentAtemSsrcProps>>({
				id: '',
				enable: { while: 1 },
				priority: 0.5,
				layer: AtemLayers.AtemSuperSourceProps,
				content: {
					deviceType: TSR.DeviceType.ATEM,
					type: TSR.TimelineContentTypeAtem.SSRCPROPS,
					ssrcProps: parseSuperSourceProps(context, part.payload),
				},
			}),

			literal<TimelineBlueprintExt<TSR.TimelineContentAtemSsrc>>({
				id: '',
				enable: { start: 0 },
				priority: 1,
				layer: AtemLayers.AtemSuperSourceBoxes,
				content: {
					deviceType: TSR.DeviceType.ATEM,
					type: TSR.TimelineContentTypeAtem.SSRC,

					ssrc: {
						boxes,
					},
				},
			})
		)
	} else if (config.visionMixer.type === VisionMixerDevice.VMix) {
		retainPieceTimelineObjects.push(
			literal<TimelineBlueprintExt<TSR.TimelineContentVMixInput>>({
				id: '',
				enable: { start: 0 },
				priority: 1,
				layer: VMixLayers.VMixDVEMultiView,
				content: {
					deviceType: TSR.DeviceType.VMIX,
					type: TSR.TimelineContentTypeVMix.INPUT,
					overlays: {
						1: boxes[0]?.source ?? -1,
						2: boxes[1]?.source ?? -1,
					},
				},
			})
		)
	} else {
		assertUnreachable(config.visionMixer.type)
	}

	/**
	 * this piece contains just the ATEM SSrc or vMix Multiview layouts and will
	 * stay on when you adlib a different primary to retain
	 * the layout
	 */
	const retainPiece: IBlueprintPiece = {
		enable: {
			start: 0,
		},
		externalId: part.payload.externalId,
		name: `DVE Retain`,
		lifespan: PieceLifespan.OutOnSegmentEnd,
		sourceLayerId: SourceLayer.DVE_RETAIN,
		outputLayerId: getOutputLayerForSourceLayer(SourceLayer.DVE_RETAIN),
		prerollDuration: SUPER_SOURCE_LATENCY,
		content: {
			...dveLayoutToContent(config, { boxes }, part.payload.inputs),
			timelineObjects: retainPieceTimelineObjects,
		},
	}

	const pieces = [dvePiece, retainPiece]
	const scriptPiece = createScriptPiece(part.payload.script, part.payload.externalId)
	if (scriptPiece) pieces.push(scriptPiece)

	const graphics = parseGraphicsFromObjects(config, part.objects)
	if (graphics.pieces) pieces.push(...graphics.pieces)

	const clips = parseClipsFromObjects(context, config, part.objects)

	return {
		part: {
			externalId: part.payload.externalId,
			title: part.payload.name,

			expectedDuration: part.payload.duration,
		},
		pieces,
		adLibPieces: [...graphics.adLibPieces, ...clips],
		actions: [],
	}
}
