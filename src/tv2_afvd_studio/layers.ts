import * as _ from 'underscore'

export type LLayer = VirtualAbstractLLayer | AtemLLayer | CasparLLayer | SisyfosLLAyer

/** Get all the Real LLayers (map to devices). Note: Does not include some which are dynamically generated */
export function RealLLayers() {
	return (
		_.values(AtemLLayer)
			// @ts-ignore
			.concat(_.values(CasparLLayer))
			.concat(_.values(SisyfosLLAyer))
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

	CasparCGGraphics = 'casparcg_cg_graphics',
	CasparCGEffects = 'casparcg_cg_effects',
	CasparCGDVELoop = 'casparcg_dve_loop',

	CasparCountdown = 'casparcg_cg_countdown'
}

export enum SisyfosLLAyer {
	SisyfosSourceClipPending = 'sisyfos_source_clip_pending'
}

export function CasparPlayerClip(i: number) {
	return `casparcg_player_clip_${i}`
}

export function SisyfosSourceClip(i: number | string) {
	return `sisyfos_player_clip_${i}`
}

export function SisyfosSourceCamera(name: string) {
	return `sisyfos_camera_active_${name.replace(' ', '_').trim()}`
}

export function SisyfosSourceRemote(name: string, variant?: string) {
	let source = `sisyfos_remote_source_${name}`
	if (variant) {
		source = `${source}_${variant.replace(' ', '_')}`
	}
	return source
}

export function SisyfosSourceTelefon(i: string) {
	return `sisyfos_telefon_source_${i.replace(' ', '_').trim()}`
}

export function HyperdeckLLayer(index: number) {
	return `hyperdeck${index}`
}
