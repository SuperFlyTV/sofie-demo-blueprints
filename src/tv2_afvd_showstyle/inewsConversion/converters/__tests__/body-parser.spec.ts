import { literal } from '../../../../common/util'
import { ParseBody, PartDefinition, PartType } from '../ParseBody'

describe('Body parser', () => {
	test('test1', () => {
		const body1 =
			'\r\n<p></p>\r\n<p><pi>*****TEKNIK*****</pi></p>\r\n<p><cc>1---JINGLE sport grafisk intro---></cc><a idref="0"><cc><----</cc></a></p>\r\n<p><cc>2---AUDIO til grafisk intro , fortsætter under teasere---></cc><a idref="1"><cc><----</cc></a></p>\r\n<p><cc>3---SS3 Sport WIPE-></cc><a idref="2"></a></p>\r\n<p><cc>4---Sport intro soundbed--></cc><a idref="3"><cc><---</cc></a></p>\r\n<p><cc>5---LED hvid på GENESIS--></cc><a idref="4"><cc><--</cc></a></p>\r\n<p><cc>6---SS3 Sport WIPE-></cc><a idref="5"></a></p>\r\n<p><cc>7---LYS:  SPORT 1 --></cc><a idref="6"><cc><--</cc></a></p>\r\n<p><cc>8---Kalder Viz Wall og kalder inputs-----</cc><a idref="7"><cc>------</cc></a></p>\r\n<p><cc>9---VCP STILL DIGI her-></cc><a idref="8"><cc><---</cc></a></p>\r\n<p></p>\r\n'
		const cues1 = [['1'], ['2'], ['3'], ['4'], ['5'], ['6'], ['7'], ['8'], ['9']]

		const result = ParseBody('00000000001', body1, cues1)
		expect(result).toEqual(
			literal<PartDefinition[]>([
				{
					type: PartType.Teknik,
					cues: [['1'], ['2'], ['3'], ['4'], ['5'], ['6'], ['7'], ['8'], ['9']],
					script: '',
					variant: {},
					externalId: '00000000001-0',
					rawType: 'TEKNIK'
				}
			])
		)
	})

	test('test2', () => {
		const body2 =
			'\r\n<p></p>\r\n<p>Thid id thr trext for the next DVE</p>\r\n<p><pi>***LIVE*** </pi></p>\r\n<p><a idref="0"></a></p>\r\n<p><a idref="1"></a></p>\r\n<p><a idref="4"></a></p>\r\n<p><cc>Spib her</cc></p>\r\n<p></p>\r\n\r\n<p>Script here</p>\r\n'
		const cues2 = [['1'], ['2'], null, ['4'], ['5']]

		const result = ParseBody('00000000001', body2, cues2)
		expect(result).toEqual(
			literal<PartDefinition[]>([
				{
					type: PartType.Live,
					cues: [['1'], ['2'], ['5']],
					script: 'Script here\n',
					variant: {},
					externalId: '00000000001-0',
					rawType: 'LIVE'
				}
			])
		)
	})

	test('test3', () => {
		const body3 =
			'\r\n<p><pi>KAM AR</pi></p>\r\n<p></p>\r\n<p><a idref="0"></a></p>\r\n<p><cc>------vcp digi her-></cc><a idref="8"><cc><----</cc></a></p>\r\n<p></p>\r\n<p>Det blev en turbulent sidste sæson for håndboldtræner Kristian Kristensen i Herning Ikast. Et anstrengt forhold til klubbens ledelse endte med et DM-sølv. Nu venter så nye udfordringer i en ny klub og i en ny liga - for i dag blev præsenteret som assistent i Ribe Esbjerg. </p>\r\n<p></p>\r\n<p>***<pi>SERVER*** </pi></p>\r\n<p><cc>----ss3 Sport LOOP-></cc><a idref="1"><cc><-</cc></a></p>\r\n<p><cc>---bundter herunder---></cc></p>\r\n<p> </p>\r\n<p><a idref="2">   </a></p>\r\n<p><a idref="3"></a></p>\r\n<p> <a idref="4">  </a></p>\r\n<p><a idref="5"></a></p>\r\n<p><a idref="6"></a></p>\r\n<p><a idref="7"></a></p>\r\n<p><pi>SLUTORD: ... ekstra kick</pi></p>\r\n<p></p>\r\n'
		const cues3 = [['1'], ['2'], ['3'], ['4'], ['5'], ['6'], ['7'], ['8'], ['9']]

		const result = ParseBody('00000000001', body3, cues3)
		expect(result).toEqual(
			literal<PartDefinition[]>([
				{
					type: PartType.Kam,
					rawType: 'KAM AR',
					cues: [['1'], ['9']],
					script:
						'Det blev en turbulent sidste sæson for håndboldtræner Kristian Kristensen i Herning Ikast. Et anstrengt forhold til klubbens ledelse endte med et DM-sølv. Nu venter så nye udfordringer i en ny klub og i en ny liga - for i dag blev præsenteret som assistent i Ribe Esbjerg.\n',
					variant: {
						name: 'AR'
					},
					externalId: '00000000001-0'
				},
				{
					type: PartType.Server,
					rawType: 'SERVER',
					cues: [['2'], ['3'], ['4'], ['5'], ['6'], ['7'], ['8']],
					script: '',
					variant: {},
					externalId: '00000000001-1'
				}
			])
		)
	})

	test('test4', () => {
		const body4 =
			"\r\n<p></p>\r\n<p><a idref='0'></a></p>\r\n<p><pi>CAMERA 1</pi></p>\r\n<p>Her står em masse tekst</p>\r\n"
		const cues4 = [['1']]
		const result = ParseBody('00000000001', body4, cues4)
		expect(result).toEqual(
			literal<PartDefinition[]>([
				{
					type: PartType.Kam,
					rawType: 'CAMERA 1',
					cues: [], // TODO: Cue outside part
					script: 'Her står em masse tekst\n',
					variant: {
						name: '1'
					},
					externalId: '00000000001-0'
				}
			])
		)
	})

	test('test5', () => {
		const body5 =
			'\r\n<p></p>\r\n<p></p>\r\n<p><pi>KAM 1 </pi></p>\r\n<p><cc>--tlftopt-></cc><a idref="0"><cc><--</cc></a></p>\r\n<p></p>\r\n<p></p>\r\n<p><a idref="1"><pi>************ 100%GRAFIK ***********</pi></a></p>\r\n<p><a idref="4"></a></p>\r\n<p><a idref="3"></a></p>\r\n<p></p>\r\n'
		const cues5 = [['1'], ['2'], ['3'], ['4'], ['5']]
		const result = ParseBody('00000000001', body5, cues5)
		expect(result).toEqual(
			literal<PartDefinition[]>([
				{
					type: PartType.Kam,
					rawType: 'KAM 1',
					cues: [['1']], // TODO: There should be another cue
					script: '',
					variant: {
						name: '1'
					},
					externalId: '00000000001-0'
				},
				{
					type: PartType.Grafik,
					rawType: '100%GRAFIK',
					cues: [['5'], ['4']],
					script: '',
					variant: {},
					externalId: '00000000001-1'
				}
			])
		)
	})

	test('test6', () => {
		const body6 =
			'\r\n<p><pi></pi></p>\r\n<p><pi></pi></p>\r\n<p><pi>KAM 1 </pi></p>\r\n<p><cc>--værter-></cc><a idref="0"><cc><--</cc><pi></pi></a></p>\r\n'
		const cues6 = [['1']]
		const result = ParseBody('00000000001', body6, cues6)
		expect(result).toEqual(
			literal<PartDefinition[]>([
				{
					type: PartType.Kam,
					rawType: 'KAM 1',
					cues: [['1']],
					script: '',
					variant: {
						name: '1'
					},
					externalId: '00000000001-0'
				}
			])
		)
	})

	test('test12', () => {
		const body12 =
			'\r\n<p><cc>Hvad er vinklen på dette interview: Trumps brug af sociale medier er unikke for en amerikansk præsident.</cc></p>\r\n<p></p>\r\n<p></p>\r\n<p><pi>KAM 3</pi></p>\r\n<p></p>\r\n<p><a idref="0"><cc> GÆSTEBAGGRUND</cc></a></p>\r\n<p></p>\r\n<p><a idref="1"> <cc>Kilde til optagelse på select-feed. </cc></a></p>\r\n<p></p>\r\n<p><cc>Manus herunder:</cc></p>\r\n<p></p>\r\n<p>Og så kan vi byde velkommen til Kaare Sørensen, digital udviklingsredaktør her på TV 2 og tidligere USA-korrespondent. </p>\r\n<p></p>\r\n<p>Du har fulgt Trumps brug af sociale medier og herunder særligt præsidentens brug af Twitter. Hvad kendetegner Donald Trumps brug af sociale medier? </p>\r\n<p></p>\r\n<p><pi>***LIVE*** </pi></p>\r\n<p><cc>Husk at lave en BUNDT. Opret den med tidsangivelse x.xx.</cc></p>\r\n<p>.</p>\r\n<p></p>\r\n<p><pi>Hvis vi kigger specifikt på Twitter, hvordan skiller Trump sig ud fra tidligere præsidenter, når det kommer til brugen af det her? </pi></p>\r\n<p></p>\r\n<p><pi>Hvad får præsidenten ud af den her adfærd på de sociale medier?</pi></p>\r\n<p></p>\r\n<p><pi>Har han en særlig strategi med den her måde at bruge twitter på? </pi></p>\r\n<p></p>\r\n<p><pi>Vi har med en præsident at gøre, der konstant laver overskrifter med brugen af sociale medier. Hvad det, der gør, at medier over hele kloden bliver ved med at beskæftige sig med de her tweets? </pi></p>\r\n<p></p>\r\n<p><a idref="2"></a></p>\r\n<p></p>\r\n'
		const cues12 = [['1'], ['2'], ['3']]
		const result = ParseBody('00000000001', body12, cues12)
		expect(result).toEqual(
			literal<PartDefinition[]>([
				{
					type: PartType.Kam,
					rawType: 'KAM 3',
					cues: [['1'], ['2']],
					script:
						'Og så kan vi byde velkommen til Kaare Sørensen, digital udviklingsredaktør her på TV 2 og tidligere USA-korrespondent.\nDu har fulgt Trumps brug af sociale medier og herunder særligt præsidentens brug af Twitter. Hvad kendetegner Donald Trumps brug af sociale medier?\n',
					variant: {
						name: '3'
					},
					externalId: '00000000001-0'
				},
				{
					type: PartType.Live,
					rawType: 'LIVE',
					cues: [['3']],
					script:
						'.\nHvis vi kigger specifikt på Twitter, hvordan skiller Trump sig ud fra tidligere præsidenter, når det kommer til brugen af det her?\nHvad får præsidenten ud af den her adfærd på de sociale medier?\nHar han en særlig strategi med den her måde at bruge twitter på?\nVi har med en præsident at gøre, der konstant laver overskrifter med brugen af sociale medier. Hvad det, der gør, at medier over hele kloden bliver ved med at beskæftige sig med de her tweets?\n',
					variant: {},
					externalId: '00000000001-1'
				}
			])
		)
	})
})
