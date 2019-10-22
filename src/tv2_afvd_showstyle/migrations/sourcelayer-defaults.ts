import { ISourceLayer, SourceLayerType } from 'tv-automation-sofie-blueprints-integration'
import { literal } from '../../common/util'
import { SourceLayer } from '../layers'

export default literal<ISourceLayer[]>([
	{
		_id: SourceLayer.PgmCam,
		_rank: 13000,
		name: 'Cam',
		abbreviation: 'C ',
		type: SourceLayerType.CAMERA,
		onPGMClean: true,
		activateKeyboardHotkeys: 'f1,f2,f3,f4,8,9',
		assignHotkeysToGlobalAdlibs: true,
		onPresenterScreen: true,
		unlimited: false,
		exclusiveGroup: 'fullscreen_pgm'
	},
	{
		_id: SourceLayer.PgmServer,
		_rank: 12000,
		name: 'Server',
		abbreviation: 'VT',
		type: SourceLayerType.VT,
		activateKeyboardHotkeys: 'f7,f8',
		onPGMClean: true,
		onPresenterScreen: true,
		unlimited: false,
		exclusiveGroup: 'fullscreen_pgm'
	},
	{
		_id: SourceLayer.PgmVoiceOver,
		_rank: 11000,
		name: 'Voice Over',
		abbreviation: 'VO',
		type: SourceLayerType.LIVE_SPEAK,
		onPGMClean: true,
		unlimited: false
	},
	{
		_id: SourceLayer.PgmGraphics,
		_rank: 10000,
		name: 'Graphics',
		type: SourceLayerType.GRAPHICS,
		onPGMClean: false,
		activateKeyboardHotkeys: 'q,w,e,r,t,y',
		clearKeyboardHotkey: 'u,alt+j,alt+u',
		allowDisable: true,
		unlimited: false
	},
	{
		_id: SourceLayer.PgmJingle,
		_rank: 9000,
		name: 'Jingle',
		type: SourceLayerType.TRANSITION,
		onPGMClean: true,
		activateKeyboardHotkeys: '',
		assignHotkeysToGlobalAdlibs: false,
		unlimited: false
	},
	{
		_id: SourceLayer.PgmLive,
		_rank: 8000,
		name: 'Live',
		type: SourceLayerType.REMOTE,
		onPGMClean: true,
		activateKeyboardHotkeys: '1,2,3,4,5,6',
		isRemoteInput: true,
		assignHotkeysToGlobalAdlibs: true,
		isSticky: true,
		activateStickyKeyboardHotkey: 'f5',
		onPresenterScreen: true,
		unlimited: false,
		exclusiveGroup: 'fullscreen_pgm'
	},
	{
		_id: SourceLayer.PgmDVE,
		_rank: 7000,
		name: 'DVE',
		type: SourceLayerType.SPLITS,
		onPGMClean: true,
		isSticky: true,
		activateStickyKeyboardHotkey: 'f6',
		onPresenterScreen: true,
		unlimited: false,
		exclusiveGroup: 'fullscreen_pgm'
	},
	{
		_id: SourceLayer.PgmTelephone,
		_rank: 6000,
		name: 'Telephone',
		type: SourceLayerType.AUDIO,
		onPGMClean: true,
		unlimited: false
	},
	{
		_id: SourceLayer.PgmBreak,
		_rank: 5000,
		name: 'Break',
		type: SourceLayerType.TRANSITION,
		onPGMClean: true,
		unlimited: false
	},
	{
		_id: SourceLayer.PgmScript,
		_rank: 4000,
		name: 'Script',
		type: SourceLayerType.SCRIPT,
		onPGMClean: true,
		unlimited: false
	},
	{
		_id: SourceLayer.PgmVIZ,
		_rank: 3000,
		name: 'VIZ',
		type: SourceLayerType.GRAPHICS,
		onPGMClean: true,
		unlimited: false
	},
	{
		_id: SourceLayer.PgmAudioBed,
		_rank: 0,
		name: 'Bed',
		type: SourceLayerType.AUDIO,
		onPGMClean: true,
		activateKeyboardHotkeys: '',
		assignHotkeysToGlobalAdlibs: false,
		unlimited: false,
		isHidden: true
	}
])
