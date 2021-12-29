import { BlueprintResultPart, IBlueprintPiece, PieceLifespan, TSR } from '@sofie-automation/blueprints-integration'
import { PartContext } from '../../common/context'
import { literal } from '../../common/util'
import { AudioSourceType, SourceType, StudioConfig } from '../../studio0/helpers/config'
import { AtemLayers } from '../../studio0/layers'
import { DVEProps, PartProps } from '../definitions'
import { getAudioPrimaryObject } from '../helpers/audio'
import { getClipPlayerInput, parseClipsFromObjects } from '../helpers/clips'
import { dveLayoutToContent, parseSuperSourceLayout, parseSuperSourceProps } from '../helpers/dve'
import { parseGraphicsFromObjects } from '../helpers/graphics'
import { createScriptPiece } from '../helpers/script'
import { getSourceInfoFromRaw } from '../helpers/sources'
import { createVisionMixerObjects } from '../helpers/visionMixer'
import { getOutputLayerForSourceLayer, SourceLayer } from '../layers'

const SUPER_SOURCE_LATENCY = 80

export function generateDVEPart(context: PartContext, part: PartProps<DVEProps>): BlueprintResultPart {
	const config = context.getStudioConfig() as StudioConfig
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

	const dvePiece: IBlueprintPiece = {
		enable: {
			start: 0,
		},
		externalId: part.payload.externalId,
		name: `DVE`, // TODO
		lifespan: PieceLifespan.WithinPart,
		sourceLayerId: SourceLayer.DVE,
		outputLayerId: getOutputLayerForSourceLayer(SourceLayer.DVE),
		adlibPreroll: SUPER_SOURCE_LATENCY,
		content: {
			...dveLayoutToContent(config, { boxes }, part.payload.inputs),

			timelineObjects: [
				...createVisionMixerObjects(config, 6000, SUPER_SOURCE_LATENCY), // TODO - use config for vmix

				literal<TSR.TimelineObjAtemSsrcProps>({
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

				literal<TSR.TimelineObjAtemSsrc>({
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
				}),

				audioTlObj,
			],
		},
	}
	/**
	 * this piece contains just the ssrc layouts and will
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
		adlibPreroll: SUPER_SOURCE_LATENCY,
		content: {
			...dveLayoutToContent(config, { boxes }, part.payload.inputs),

			timelineObjects: [
				literal<TSR.TimelineObjAtemSsrcProps>({
					id: '',
					enable: { while: 1 },
					priority: 0.5,
					layer: AtemLayers.AtemSuperSourceProps,
					content: {
						deviceType: TSR.DeviceType.ATEM,
						type: TSR.TimelineContentTypeAtem.SSRCPROPS,
						ssrcProps: {
							artFillSource: 3010, // atem mediaplayer1
							artCutSource: 3011,
							artOption: 0, // bg
							artPreMultiplied: true,
							borderEnabled: false,
						},
					},
				}),

				literal<TSR.TimelineObjAtemSsrc>({
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
				}),
			],
		},
	}

	const pieces = [dvePiece, retainPiece]
	const scriptPiece = createScriptPiece(part.payload.script, part.payload.externalId)
	if (scriptPiece) pieces.push(scriptPiece)

	const graphics = parseGraphicsFromObjects(config, part.objects)
	if (graphics.pieces) pieces.push(...graphics.pieces)

	const clips = parseClipsFromObjects(config, part.objects)

	return {
		part: {
			externalId: part.payload.externalId,
			title: part.payload.name,

			expectedDuration: part.payload.duration,
		},
		pieces,
		adLibPieces: [...graphics.adLibPieces, ...clips],
	}
}
