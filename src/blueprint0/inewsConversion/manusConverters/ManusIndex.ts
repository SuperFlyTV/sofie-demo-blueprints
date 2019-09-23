import { ManusTypeEmpty } from './ManusTypeEmpty'
import { ManusTypeKam } from './ManusTypeKam'
import { ManusTypeServer } from './ManusTypeServer'
import { ManusTypeVO } from './ManusTypeVO'
import { ManusTypeRemote } from './ManusTypeRemote'

/* THIS IS THE LIST OF BODY CODES THAT WE NEED TO SPLIT INTO SEGMENTS:
 * GROUPED INTO:
 * 1: KAM (cam + script )
 * 2: SERVER (playout)
 * 3: VO (cam voiceover playout)
 * 4: LIVE (remote and studio/playout)

 * The rest detailes in the Body codes should be handled in blueprints
*/

export const ELEMENT_CODE_TYPES = [
	{ code: 'KAM', type: 1 },
	{ code: 'ATTACK', type: 2 },
	{ code: 'SERVER', type: 2 },
	{ code: 'EVS2', type: 2 },
	{ code: 'EVS1', type: 2 },
	{ code: 'K2', type: 2 },
	{ code: 'VO', type: 3 },
	{ code: 'VOSB', type: 3 },
	{ code: 'EVS2VO', type: 3 },
	{ code: 'EVS1VO', type: 3 },
	{ code: 'ME1VO', type: 3 },
	{ code: 'VOV', type: 3 },
	{ code: 'VOLIVE', type: 3 }
]

export { ManusTypeEmpty, ManusTypeKam, ManusTypeServer, ManusTypeVO, ManusTypeRemote }
