import { ISourceLayer, SourceLayerType } from 'tv-automation-sofie-blueprints-integration'
import { literal } from '../../common/util'
import { SourceLayer } from '../../types/layers'

export default literal<ISourceLayer[]>([
	{
		_id: SourceLayer.PgmClip,
		_rank: 9000,
		name: 'VT',
		abbreviation: 'VT',
		type: SourceLayerType.VT,
		activateKeyboardHotkeys: 'f7,f8',
		onPGMClean: true,
		onPresenterScreen: true,
		unlimited: false,
		exclusiveGroup: 'fullscreen_pgm'
	},
	{
		_id: SourceLayer.PgmGraphicsSuper,
		_rank: 1000,
		name: 'Super',
		type: SourceLayerType.GRAPHICS,
		onPGMClean: false,
		activateKeyboardHotkeys: 'q,w,e,r,t,y',
		clearKeyboardHotkey: 'u,alt+j,alt+u',
		allowDisable: true,
		unlimited: false
	},
	{
		_id: SourceLayer.PgmSplit,
		_rank: 11000,
		name: 'Split',
		abbreviation: 'DVE',
		type: SourceLayerType.SPLITS,
		onPGMClean: true,
		isSticky: true,
		activateStickyKeyboardHotkey: 'f6',
		onPresenterScreen: true,
		unlimited: false,
		exclusiveGroup: 'fullscreen_pgm'
	},
	{
		_id: SourceLayer.PgmRemote,
		_rank: 10000,
		name: 'DIR',
		abbreviation: 'DIR',
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
		_id: SourceLayer.PgmScript,
		_rank: 14000,
		name: 'Manus',
		type: SourceLayerType.SCRIPT,
		onPGMClean: true,
		unlimited: false
	},
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
		_id: SourceLayer.PgmTransition,
		_rank: 0,
		name: 'Transition',
		type: SourceLayerType.TRANSITION,
		onPGMClean: true,
		activateKeyboardHotkeys: '',
		assignHotkeysToGlobalAdlibs: false,
		unlimited: false
	},
	{
		_id: SourceLayer.PgmHyperdeck,
		_rank: 0,
		name: 'Hyperdeck',
		type: SourceLayerType.UNKNOWN,
		onPGMClean: true,
		activateKeyboardHotkeys: '',
		assignHotkeysToGlobalAdlibs: false,
		unlimited: false,
		isHidden: true
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
