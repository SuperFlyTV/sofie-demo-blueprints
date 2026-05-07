export enum AtemLayers {
	AtemMeProgram = 'atem_me_program',
	AtemMePreview = 'atem_me_preview',
	AtemDskGraphics = 'atem_dsk_graphics',
	AtemSuperSourceProps = 'atem_supersource_props',
	AtemSuperSourceBoxes = 'atem_supersource_boxes',
}

export enum VMixLayers {
	VMixMeProgram = 'vmix_me_program',
	VMixMePreview = 'vmix_me_preview',
	VMixOverlayGraphics = 'vmix_overlay_graphics',
	VMixDVEMultiView = 'vmix_dve_multiview',
}
export enum OGrafLayers {
	OGrafFullScreenLoad = 'ograf_full_screen_load',
	OGrafFullScreenPlay = 'ograf_full_screen_play',
	OGrafFullScreenStop = 'ograf_full_screen_stop',
	OGrafOverlay1Load = 'ograf_overlay_1_load',
	OGrafOverlay1Play = 'ograf_overlay_1_play',
	OGrafOverlay1Stop = 'ograf_overlay_1_stop',
	OGrafOverlay2Load = 'ograf_overlay_2_load',
	OGrafOverlay2Play = 'ograf_overlay_2_play',
	OGrafOverlay2Stop = 'ograf_overlay_2_stop',
	OGrafOverlay3Load = 'ograf_overlay_3_load',
	OGrafOverlay3Play = 'ograf_overlay_3_play',
	OGrafOverlay3Stop = 'ograf_overlay_3_stop',
}

export enum OBSLayers {
	OBSCurrentScene = 'obs_current_scene',
	OBSCurrentTransition = 'obs_current_transition',
	OBSDownstreamKeyer = 'obs_downstream_keyer',
}

export enum CasparCGLayers {
	CasparCGClipPlayer1 = 'casparcg_clip_player1',
	CasparCGClipPlayer2 = 'casparcg_clip_player2',
	CasparCGClipPlayerAbPending = 'casparcg_clip_player_ab_pending',
	CasparCGClipPlayerPreview = 'casparcg_clip_player_preview',
	CasparCGEffectsPlayer = 'casparcg_effects_player',

	CasparCGGraphicsLowerThird = 'casparcg_graphics_l3d',
	CasparCGGraphicsTicker = 'casparcg_graphics_ticker',
	CasparCGGraphicsStrap = 'casparcg_graphics_strap',
	CasparCGGraphicsLogo = 'casparcg_graphics_logo',
	CasparCGAudioBed = 'casparcg_audio_bed',
}

export enum AbstractLayers {
	CoreAbstract = 'core_abstract',
}

export enum SisyfosLayers {
	Baseline = 'sisyfos_baseline',
	Primary = 'sisyfos_primary',
	Guests = 'sisyfos_guests',
	HostOverride = 'sisyfos_host_override',
	ForceMute = 'sisyfos_forceMute',
}
