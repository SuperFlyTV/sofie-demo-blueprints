import * as _ from 'underscore'

export type LLayer = VirtualAbstractLLayer | AtemLLayer | CasparLLayer | SisyfosLLAyer

/** Get all the Real LLayers (map to devices). Note: Does not include some which are dynamically generated */
export function RealLLayers() {
	return (
		_.values(AtemLLayer)
			// @ts-ignore
			.concat(_.values(CasparLLayer))
			.concat(_.values(SisyfosLLAyer))
			.concat(_.values(VizLLayer))
	)
}
export function VirtualLLayers() {
	return _.values(VirtualAbstractLLayer)
}

export enum VirtualAbstractLLayer {
	RecordControl = 'record_control'
}

export enum AtemLLayer {
	AtemMEProgram = 'atem_me_program',
	AtemDSKGraphics = 'atem_dsk_graphics',
	AtemDSKEffect = 'atem_dsk_effect',
	AtemAuxLookahead = 'atem_aux_lookahead',
	AtemAuxSSrc = 'atem_aux_ssrc',
	AtemAuxClean = 'atem_aux_clean',
	AtemAuxScreen = 'atem_aux_screen',
	AtemSSrcArt = 'atem_supersource_art',
	AtemSSrcDefault = 'atem_supersource_default',
	AtemSSrcOverride = 'atem_supersource_override'
}

export enum CasparLLayer {
	CasparPlayerClip = 'casparcg_player_clip',
	CasparPlayerClipNext = 'casparcg_player_clip_next',
	CasparPlayerClipNextWarning = 'casparcg_player_clip_next_warning',
	CasparPlayerClipNextCustom = 'casparcg_player_clip_next_custom',
	CasparPlayerWipe = 'casparcg_player_wipe',
	CasparPlayerSoundEffect = 'casparcg_player_soundeffect',
	CasparPlayerClipPending = 'casparcg_player_clip_pending',
	CasparPlayerJingle = 'casparcg_player_jingle',
	CasparCGGraphics = 'casparcg_cg_graphics',
	CasparCGEffects = 'casparcg_cg_effects',
	CasparCGDVELoop = 'casparcg_dve_loop',
	CasparCGLYD = 'casparcg_audio_lyd',
	CasparCountdown = 'casparcg_cg_countdown',
	CasparCGDVETemplate = 'casparcg_cg_dve_template',
	CasparCGDVEKey = 'casparcg_dve_key',
	CasparCGDVEFrame = 'casparcg_dve_frame'
}

export enum SisyfosLLAyer {
	SisyfosSourceClipPending = 'sisyfos_source_clip_pending',
	SisyfosSourceJingle = 'sisyfos_source_jingle',
	SisyfosSourceAudio = 'sisyfos_source_audio',
	SisyfosSourceLiveSpeak = 'sisyfos_source_live_speak',
	SisyfosSourceTLF = 'sisyfos_source_tlf_hybrid',
	SisyfosSourceVært_1_ST_A = 'sisyfos_source_vært_1_st_a',
	SisyfosSourceVært_2_ST_A = 'sisyfos_source_vært_2_st_a',
	SisyfosSourceGæst_1_ST_A = 'sisyfos_source_gæst_1_st_a',
	SisyfosSourceGæst_2_ST_A = 'sisyfos_source_gæst_2_st_a',
	SisyfosSourceGæst_3_ST_A = 'sisyfos_source_gæst_3_st_a',
	SisyfosSourceGæst_4_ST_A = 'sisyfos_source_gæst_4_st_a',
	SisyfosSourceVært_1_ST_B = 'sisyfos_source_vært_1_st_b',
	SisyfosSourceVært_2_ST_B = 'sisyfos_source_vært_2_st_b',
	SisyfosSourceGæst_1_ST_B = 'sisyfos_source_gæst_1_st_b',
	SisyfosSourceGæst_2_ST_B = 'sisyfos_source_gæst_2_st_b',
	SisyfosSourceGæst_3_ST_B = 'sisyfos_source_gæst_3_st_b',
	SisyfosSourceGæst_4_ST_B = 'sisyfos_source_gæst_4_st_b',
	SisyfosSourceLive_1 = 'sisyfos_source_live_1',
	SisyfosSourceLive_2 = 'sisyfos_source_live_2',
	SisyfosSourceLive_3 = 'sisyfos_source_live_3',
	SisyfosSourceLive_4 = 'sisyfos_source_live_4',
	SisyfosSourceLive_5 = 'sisyfos_source_live_5',
	SisyfosSourceLive_6 = 'sisyfos_source_live_6',
	SisyfosSourceLive_7 = 'sisyfos_source_live_7',
	SisyfosSourceLive_8 = 'sisyfos_source_live_8',
	SisyfosSourceLive_9 = 'sisyfos_source_live_9',
	SisyfosSourceLive_10 = 'sisyfos_source_live_10',
	SisyfosSourceEVS_1 = 'sisyfos_source_evs_1',
	SisyfosSourceEVS_2 = 'sisyfos_source_evs_2',
	SisyfosSourceClip_1 = 'sisyfos_player_clip_1',
	SisyfosSourceClip_2 = 'sisyfos_player_clip_2'
}

export enum VizLLayer {
	VizLLayerOverlay = 'viz_layer_overlay',
	VizLLayerPilot = 'viz_layer_pilot',
	VizLLayerDesign = 'viz_layer_design',
	VizLLayerDVEBackground = 'viz_layer_dve_background',
	VizLLayerContinue = 'viz_layer_continue'
}

export function CasparPlayerClip(i: number) {
	return `casparcg_player_clip_${i}`
}

export function SisyfosSourceClip(i: number | string) {
	return `sisyfos_player_clip_${i}`
}

export function HyperdeckLLayer(index: number) {
	return `hyperdeck${index}`
}
