import { literal } from '../../../../common/util'
import { ParseBody, PartDefinition } from '../BodyCodesToJS'

describe('Body parser', () => {
	test('test1', () => {
		const body1 =
			'\r\n<p></p>\r\n<p><pi>*****TEKNIK*****</pi></p>\r\n<p><cc>1---JINGLE sport grafisk intro---></cc><a idref="0"><cc><----</cc></a></p>\r\n<p><cc>2---AUDIO til grafisk intro , fortsætter under teasere---></cc><a idref="1"><cc><----</cc></a></p>\r\n<p><cc>3---SS3 Sport WIPE-></cc><a idref="2"></a></p>\r\n<p><cc>4---Sport intro soundbed--></cc><a idref="3"><cc><---</cc></a></p>\r\n<p><cc>5---LED hvid på GENESIS--></cc><a idref="4"><cc><--</cc></a></p>\r\n<p><cc>6---SS3 Sport WIPE-></cc><a idref="5"></a></p>\r\n<p><cc>7---LYS:  SPORT 1 --></cc><a idref="6"><cc><--</cc></a></p>\r\n<p><cc>8---Kalder Viz Wall og kalder inputs-----</cc><a idref="7"><cc>------</cc></a></p>\r\n<p><cc>9---VCP STILL DIGI her-></cc><a idref="8"><cc><---</cc></a></p>\r\n<p></p>\r\n'
		const cues1 = [['1'], ['2'], ['3'], ['4'], ['5'], ['6'], ['7'], ['8'], ['9']]

		const result = ParseBody(body1, cues1)
		expect(result).toEqual(
			literal<PartDefinition[]>([
				{
					type: 'TEKNIK',
					cues: [['1'], ['2'], ['3'], ['4'], ['5'], ['6'], ['7'], ['8'], ['9']],
					script: ''
				}
			])
		)
	})

	test('test2', () => {
		const body2 =
			'\r\n<p></p>\r\n<p>Thid id thr trext for the next DVE</p>\r\n<p><pi>***LIVE*** </pi></p>\r\n<p><a idref="0"></a></p>\r\n<p><a idref="1"></a></p>\r\n<p><a idref="4"></a></p>\r\n<p><cc>Spib her</cc></p>\r\n<p></p>\r\n\r\n<p>Script here</p>\r\n'
		const cues2 = [['1'], ['2'], null, ['4'], ['5']]

		const result = ParseBody(body2, cues2)
		expect(result).toEqual(
			literal<PartDefinition[]>([
				{
					type: 'LIVE',
					cues: [['1'], ['2'], ['5']],
					script: 'Script here\n'
				}
			])
		)
	})

	test('test3', () => {
		const body3 =
			'\r\n<p><pi>KAM AR</pi></p>\r\n<p></p>\r\n<p><a idref="0"></a></p>\r\n<p><cc>------vcp digi her-></cc><a idref="8"><cc><----</cc></a></p>\r\n<p></p>\r\n<p>Det blev en turbulent sidste sæson for håndboldtræner Kristian Kristensen i Herning Ikast. Et anstrengt forhold til klubbens ledelse endte med et DM-sølv. Nu venter så nye udfordringer i en ny klub og i en ny liga - for i dag blev præsenteret som assistent i Ribe Esbjerg. </p>\r\n<p></p>\r\n<p>***<pi>SERVER*** </pi></p>\r\n<p><cc>----ss3 Sport LOOP-></cc><a idref="1"><cc><-</cc></a></p>\r\n<p><cc>---bundter herunder---></cc></p>\r\n<p> </p>\r\n<p><a idref="2">   </a></p>\r\n<p><a idref="3"></a></p>\r\n<p> <a idref="4">  </a></p>\r\n<p><a idref="5"></a></p>\r\n<p><a idref="6"></a></p>\r\n<p><a idref="7"></a></p>\r\n<p><pi>SLUTORD: ... ekstra kick</pi></p>\r\n<p></p>\r\n'
		const cues3 = [['1'], ['2'], ['3'], ['4'], ['5'], ['6'], ['7'], ['8'], ['9']]

		const result = ParseBody(body3, cues3)
		expect(result).toEqual(
			literal<PartDefinition[]>([
				{
					type: 'KAM AR',
					cues: [['1'], ['9']],
					script:
						'Det blev en turbulent sidste sæson for håndboldtræner Kristian Kristensen i Herning Ikast. Et anstrengt forhold til klubbens ledelse endte med et DM-sølv. Nu venter så nye udfordringer i en ny klub og i en ny liga - for i dag blev præsenteret som assistent i Ribe Esbjerg.\n'
				},
				{
					type: 'SERVER',
					cues: [['2'], ['3'], ['4'], ['5'], ['6'], ['7'], ['8']],
					script: ''
				},
				{
					type: 'SLUTORD ekstra kick',
					cues: [],
					script: ''
				}
			])
		)
	})
})
