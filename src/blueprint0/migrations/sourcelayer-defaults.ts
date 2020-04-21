import { SourceLayerType, ISourceLayer } from 'tv-automation-sofie-blueprints-integration'
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
		onPresenterScreen: true,
		exclusiveGroup: 'fullscreen_pgm'
	},
	{
		_id: SourceLayer.PgmGraphicsSuper,
		_rank: 1000,
		name: 'Super',
		type: SourceLayerType.GRAPHICS,
		activateKeyboardHotkeys: 'q,w,e,r,t,y',
		clearKeyboardHotkey: 'u,alt+j,alt+u',
		allowDisable: true
	},
	{
		_id: SourceLayer.PgmSplit,
		_rank: 11000,
		name: 'Split',
		abbreviation: 'DVE',
		type: SourceLayerType.SPLITS,
		isSticky: true,
		activateStickyKeyboardHotkey: 'f6',
		onPresenterScreen: true,
		exclusiveGroup: 'fullscreen_pgm'
	},
	{
		_id: SourceLayer.PgmRemote,
		_rank: 10000,
		name: 'DIR',
		abbreviation: 'DIR',
		type: SourceLayerType.REMOTE,
		activateKeyboardHotkeys: '1,2,3,4,5,6',
		isRemoteInput: true,
		assignHotkeysToGlobalAdlibs: true,
		isSticky: true,
		activateStickyKeyboardHotkey: 'f5',
		onPresenterScreen: true,
		exclusiveGroup: 'fullscreen_pgm'
	},
	{
		_id: SourceLayer.PgmScript,
		_rank: 14000,
		name: 'Manus',
		type: SourceLayerType.SCRIPT
	},
	{
		_id: SourceLayer.PgmCam,
		_rank: 13000,
		name: 'Cam',
		abbreviation: 'C ',
		type: SourceLayerType.CAMERA,
		activateKeyboardHotkeys: 'f1,f2,f3,f4,8,9',
		assignHotkeysToGlobalAdlibs: true,
		onPresenterScreen: true,
		exclusiveGroup: 'fullscreen_pgm'
	},
	{
		_id: SourceLayer.PgmTransition,
		_rank: 0,
		name: 'Transition',
		type: SourceLayerType.TRANSITION,
		activateKeyboardHotkeys: '',
		assignHotkeysToGlobalAdlibs: false
	},
	{
		_id: SourceLayer.PgmHyperdeck,
		_rank: 0,
		name: 'Hyperdeck',
		type: SourceLayerType.UNKNOWN,
		activateKeyboardHotkeys: '',
		assignHotkeysToGlobalAdlibs: false,
		isHidden: true
	},
	{
		_id: SourceLayer.PgmAudioBed,
		_rank: 0,
		name: 'Bed',
		type: SourceLayerType.AUDIO,
		activateKeyboardHotkeys: '',
		assignHotkeysToGlobalAdlibs: false,
		isHidden: true
	}
])
