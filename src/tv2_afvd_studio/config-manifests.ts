import { ConfigManifestEntry, ConfigManifestEntryType } from 'tv-automation-sofie-blueprints-integration'
import * as _ from 'underscore'

export const CORE_INJECTED_KEYS = ['SofieHostURL']

export enum MediaPlayerType {
	CasparWithNext = 'CasparWithNext',
	CasparAB = 'CasparAB'
}

export const studioConfigManifest: ConfigManifestEntry[] = [
	{
		id: 'MediaFlowId',
		name: 'Media Flow Id',
		description: '',
		type: ConfigManifestEntryType.STRING,
		required: false,
		defaultVal: 'flow0'
	},
	{
		id: 'SourcesCam',
		name: 'Camera Mapping',
		description: 'Camera number to ATEM input (eg 1:1,9:2)',
		type: ConfigManifestEntryType.STRING,
		required: true,
		defaultVal: '1:11,2:12,3:13,4:14,5:15,1S:16,2S:17,3S:18,4S:19,5S:20'
	},
	{
		id: 'SourcesRM',
		name: 'RM Mapping',
		description: 'RM number to ATEM input (eg 1:6,2:7)',
		type: ConfigManifestEntryType.STRING,
		required: false,
		defaultVal: '1:1,2:2,3:3,4:4,5:5,6:6,7:7,8:8,9:9,10:10'
	},
	{
		id: 'SourcesSkype',
		name: 'Skype Mapping',
		description: 'Skype number to ATEM input (eg 1:6,2:7)',
		type: ConfigManifestEntryType.STRING,
		required: false,
		defaultVal: '1:6,2:7,3:8,4:9,5:10,6:11,7:12'
	},
	{
		id: 'HyperdeckCount',
		name: 'Hyperdeck Count',
		description: 'Number of Hyperdecks used for recordings',
		type: ConfigManifestEntryType.NUMBER,
		required: false,
		defaultVal: 1
	},
	{
		id: 'MediaPlayerType',
		name: 'Media player type',
		description: 'Type of media player to use',
		type: ConfigManifestEntryType.ENUM,
		options: _.values(MediaPlayerType),
		required: true,
		defaultVal: MediaPlayerType.CasparWithNext
	},
	{
		id: 'ABMediaPlayers',
		name: 'Media Players inputs',
		description: 'ATEM inputs for A/B media players',
		type: ConfigManifestEntryType.STRING,
		required: false,
		defaultVal: '1:26,2:27'
	},
	{
		id: 'AtemSource.DSK1F',
		name: 'ATEM DSK1 Fill',
		description: 'ATEM vision mixer input for DSK1 Fill',
		type: ConfigManifestEntryType.NUMBER,
		required: false,
		defaultVal: 13
	},
	{
		id: 'AtemSource.DSK1K',
		name: 'ATEM DSK1 Key',
		description: 'ATEM vision mixer input for DSK1 Key',
		type: ConfigManifestEntryType.NUMBER,
		required: false,
		defaultVal: 14
	},
	{
		id: 'AtemSource.DSK2F',
		name: 'ATEM DSK2 Fill',
		description: 'ATEM vision mixer input for DSK2 Fill',
		type: ConfigManifestEntryType.NUMBER,
		required: false,
		defaultVal: 15
	},
	{
		id: 'AtemSource.DSK2K',
		name: 'ATEM DSK2 Key',
		description: 'ATEM vision mixer input for DSK2 Key',
		type: ConfigManifestEntryType.NUMBER,
		required: false,
		defaultVal: 16
	},
	{
		id: 'AtemSource.ServerC',
		name: 'CasparCG Server C',
		description: 'ATEM vision mixer input for ServerC',
		type: ConfigManifestEntryType.NUMBER,
		required: false,
		defaultVal: 17
	},
	{
		id: 'AtemSource.JingleFill',
		name: 'Jingle Fill Source',
		description: 'ATEM vision mixer input for Jingle Fill',
		type: ConfigManifestEntryType.NUMBER,
		required: false,
		defaultVal: 29
	},
	{
		id: 'AtemSource.JingleKey',
		name: 'Jingle Key Source',
		description: 'ATEM vision mixer input for Jingle Source',
		type: ConfigManifestEntryType.NUMBER,
		required: false,
		defaultVal: 31
	},
	{
		id: 'AtemSource.SplitArtF',
		name: 'ATEM Split Screen Art Fill',
		description: 'ATEM vision mixer input for Split Screen Art Fill',
		type: ConfigManifestEntryType.NUMBER,
		required: false,
		defaultVal: 30
	},
	{
		id: 'AtemSource.SplitArtK',
		name: 'ATEM Split Screen Art Key',
		description: 'ATEM vision mixer input for Split Screen Art Key',
		type: ConfigManifestEntryType.NUMBER,
		required: false,
		defaultVal: 32
	},
	{
		id: 'AtemSource.Default',
		name: 'ATEM Default source',
		description: 'ATEM vision mixer default source',
		type: ConfigManifestEntryType.NUMBER,
		required: false,
		defaultVal: 2001
	},
	{
		id: 'CasparOutputDelay',
		name: 'CasparCG Output latency',
		description: 'Delay between playback and output on SDI (ms)',
		type: ConfigManifestEntryType.NUMBER,
		required: false,
		defaultVal: 320 // 8 frames (5 in decklinks + casparcg)
	}
]
