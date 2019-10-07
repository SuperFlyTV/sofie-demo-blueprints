import {
	DeviceType as PlayoutDeviceType,
	MappingAbstract,
	MappingAtem,
	MappingAtemType,
	MappingCasparCG,
	MappingHyperdeck,
	MappingHyperdeckType,
	MappingLawo,
	MappingLawoType
} from 'timeline-state-resolver-types'
import { BlueprintMapping, BlueprintMappings, LookaheadMode } from 'tv-automation-sofie-blueprints-integration'
import * as _ from 'underscore'
import { literal } from '../../common/util'
import { HyperdeckLLayer } from '../layers'

export default literal<BlueprintMappings>({
	core_abstract: literal<MappingAbstract & BlueprintMapping>({
		device: PlayoutDeviceType.ABSTRACT,
		deviceId: 'abstract0',
		lookahead: LookaheadMode.NONE
	}),
	casparcg_player_wipe: literal<MappingCasparCG & BlueprintMapping>({
		device: PlayoutDeviceType.CASPARCG,
		deviceId: 'caspar01',
		lookahead: LookaheadMode.NONE,
		channel: 3,
		layer: 199
	}),
	casparcg_player_soundeffect: literal<MappingCasparCG & BlueprintMapping>({
		device: PlayoutDeviceType.CASPARCG,
		deviceId: 'caspar01',
		lookahead: LookaheadMode.NONE,
		channel: 3,
		layer: 130
	}),
	casparcg_player_clip_next_warning: literal<MappingCasparCG & BlueprintMapping>({
		device: PlayoutDeviceType.CASPARCG,
		deviceId: 'caspar01',
		lookahead: LookaheadMode.NONE,
		channel: 4,
		layer: 99
	}),
	casparcg_player_clip_playback_a: literal<MappingCasparCG & BlueprintMapping>({
		device: PlayoutDeviceType.CASPARCG,
		deviceId: 'caspar01',
		lookahead: LookaheadMode.NONE,
		channel: 5,
		layer: 100
	}),
	casparcg_player_clip_playback_b: literal<MappingCasparCG & BlueprintMapping>({
		device: PlayoutDeviceType.CASPARCG,
		deviceId: 'caspar01',
		lookahead: LookaheadMode.NONE,
		channel: 6,
		layer: 100
	}),
	casparcg_player_clip: literal<MappingCasparCG & BlueprintMapping>({
		device: PlayoutDeviceType.CASPARCG,
		deviceId: 'caspar01',
		lookahead: LookaheadMode.PRELOAD,
		channel: 1,
		layer: 111
	}),
	casparcg_player_clip_next: literal<MappingCasparCG & BlueprintMapping>({
		device: PlayoutDeviceType.CASPARCG,
		deviceId: 'caspar01',
		lookahead: LookaheadMode.NONE,
		channel: 4,
		layer: 101
	}),
	casparcg_player_clip_next_custom: literal<MappingCasparCG & BlueprintMapping>({
		device: PlayoutDeviceType.CASPARCG,
		deviceId: 'caspar01',
		lookahead: LookaheadMode.NONE,
		channel: 4,
		layer: 110
	}),
	casparcg_cg_graphics: literal<MappingCasparCG & BlueprintMapping>({
		device: PlayoutDeviceType.CASPARCG,
		deviceId: 'caspar02',
		lookahead: LookaheadMode.NONE,
		channel: 2,
		layer: 120
	}),
	casparcg_cg_countdown: literal<MappingCasparCG & BlueprintMapping>({
		device: PlayoutDeviceType.CASPARCG,
		deviceId: 'caspar02',
		lookahead: LookaheadMode.NONE,
		channel: 1,
		layer: 120
	}),
	casparcg_cg_effects: literal<MappingCasparCG & BlueprintMapping>({
		device: PlayoutDeviceType.CASPARCG,
		deviceId: 'caspar01',
		lookahead: LookaheadMode.NONE,
		channel: 3,
		layer: 120
	}),
	atem_me_program: literal<MappingAtem & BlueprintMapping>({
		device: PlayoutDeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.NONE,
		mappingType: MappingAtemType.MixEffect,
		index: 0 // 0 = ME1
	}),
	atem_aux_lookahead: literal<MappingAtem & BlueprintMapping>({
		device: PlayoutDeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.WHEN_CLEAR,
		mappingType: MappingAtemType.Auxilliary,
		index: 1
	}),
	atem_aux_ssrc: literal<MappingAtem & BlueprintMapping>({
		device: PlayoutDeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.NONE,
		mappingType: MappingAtemType.Auxilliary,
		index: 2
	}),
	atem_aux_clean: literal<MappingAtem & BlueprintMapping>({
		// to be removed
		device: PlayoutDeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.NONE,
		mappingType: MappingAtemType.Auxilliary,
		index: 5
	}),
	atem_aux_screen: literal<MappingAtem & BlueprintMapping>({
		device: PlayoutDeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.NONE,
		mappingType: MappingAtemType.Auxilliary,
		index: 3
	}),
	atem_dsk_graphics: literal<MappingAtem & BlueprintMapping>({
		device: PlayoutDeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.NONE,
		mappingType: MappingAtemType.DownStreamKeyer,
		index: 0 // 0 = DSK1
	}),
	atem_dsk_effect: literal<MappingAtem & BlueprintMapping>({
		device: PlayoutDeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.NONE,
		mappingType: MappingAtemType.DownStreamKeyer,
		index: 1 // 1 = DSK2
	}),
	atem_supersource_art: literal<MappingAtem & BlueprintMapping>({
		device: PlayoutDeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.NONE,
		mappingType: MappingAtemType.SuperSourceProperties,
		index: 0 // 0 = SS
	}),
	atem_supersource_default: literal<MappingAtem & BlueprintMapping>({
		device: PlayoutDeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.NONE,
		mappingType: MappingAtemType.SuperSourceBox,
		index: 0 // 0 = SS
	}),
	atem_supersource_override: literal<MappingAtem & BlueprintMapping>({
		device: PlayoutDeviceType.ATEM,
		deviceId: 'atem0',
		lookahead: LookaheadMode.RETAIN,
		mappingType: MappingAtemType.SuperSourceBox,
		index: 0 // 0 = SS
	}),
	lawo_source_automix: literal<MappingLawo & BlueprintMapping>({
		device: PlayoutDeviceType.LAWO,
		deviceId: 'lawo0',
		lookahead: LookaheadMode.NONE,
		mappingType: MappingLawoType.SOURCE,
		identifier: 'AMix'
	}),
	lawo_source_clip_stk: literal<MappingLawo & BlueprintMapping>({
		device: PlayoutDeviceType.LAWO,
		deviceId: 'lawo0',
		lookahead: LookaheadMode.NONE,
		mappingType: MappingLawoType.SOURCE,
		identifier: 'STK'
	})
})

export function getHyperdeckMappings(count: number) {
	const res: BlueprintMappings = {}

	for (let i = 0; i < count; i++) {
		const id = HyperdeckLLayer(i)
		res[id] = literal<MappingHyperdeck & BlueprintMapping>({
			device: PlayoutDeviceType.HYPERDECK,
			deviceId: id,
			mappingType: MappingHyperdeckType.TRANSPORT,
			lookahead: LookaheadMode.NONE
		})
	}

	return res
}
