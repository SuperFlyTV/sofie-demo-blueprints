import * as _ from 'underscore'

export enum SourceLayer {
	// Graphics
	PgmGraphicsSuper = 'studio0_graphics_super',

	// Pgm
	PgmTransition = 'studio0_transition0',
	PgmClip = 'studio0_clip0',
	PgmCam = 'studio0_camera0',
	PgmSplit = 'studio0_split0',
	PgmRemote = 'studio0_remote0',
	PgmHyperdeck = 'studio0_hyperdeck0',
	PgmAudioBed = 'studio0_audio_bed',
	PgmScript = 'studio0_script'
}

export type LLayer = VirtualAbstractLLayer | AtemLLayer | CasparLLayer

/** Get all the Real LLayers (map to devices). Note: Does not include some which are dynamically generated */
export function RealLLayers () {
	return _.values(AtemLLayer)
		.concat(_.values(CasparLLayer))
		.concat(_.values(LawoLLayer))
}
export function VirtualLLayers () {
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

	CasparCGGraphics = 'casparcg_cg_graphics',
	CasparCGEffects = 'casparcg_cg_effects',

	CasparCountdown = 'casparcg_cg_countdown'
}

export function HyperdeckLLayer (index: number) {
	return `hyperdeck${index}`
}

export enum LawoLLayer {
	LawoSourceAutomix = 'lawo_source_automix',
	LawoSourceClipStk = 'lawo_source_clip_stk'
}
