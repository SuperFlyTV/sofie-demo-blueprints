import { literal } from '../../../../common/util'
import { ParseBody, PartDefinition, PartType } from '../ParseBody'

const fields = {}

describe('Body parser', () => {
	test('test1', () => {
		const body1 =
			'\r\n<p></p>\r\n<p><pi>*****TEKNIK*****</pi></p>\r\n<p><cc>1---JINGLE sport grafisk intro---></cc><a idref="0"><cc><----</cc></a></p>\r\n<p><cc>2---AUDIO til grafisk intro , fortsætter under teasere---></cc><a idref="1"><cc><----</cc></a></p>\r\n<p><cc>3---SS3 Sport WIPE-></cc><a idref="2"></a></p>\r\n<p><cc>4---Sport intro soundbed--></cc><a idref="3"><cc><---</cc></a></p>\r\n<p><cc>5---LED hvid på GENESIS--></cc><a idref="4"><cc><--</cc></a></p>\r\n<p><cc>6---SS3 Sport WIPE-></cc><a idref="5"></a></p>\r\n<p><cc>7---LYS:  SPORT 1 --></cc><a idref="6"><cc><--</cc></a></p>\r\n<p><cc>8---Kalder Viz Wall og kalder inputs-----</cc><a idref="7"><cc>------</cc></a></p>\r\n<p><cc>9---VCP STILL DIGI her-></cc><a idref="8"><cc><---</cc></a></p>\r\n<p></p>\r\n'
		const cues1 = [['1'], ['2'], ['3'], ['4'], ['5'], ['6'], ['7'], ['8'], ['9']]

		const result = ParseBody('00000000001', body1, cues1, fields, 0)
		expect(result).toEqual(
			literal<PartDefinition[]>([
				{
					type: PartType.Teknik,
					cues: [['1'], ['2'], ['3'], ['4'], ['5'], ['6'], ['7'], ['8'], ['9']],
					script: '',
					variant: {},
					externalId: '00000000001-0',
					rawType: 'TEKNIK',
					fields: {},
					modified: 0
				}
			])
		)
	})

	test('test2', () => {
		const body2 =
			'\r\n<p></p>\r\n<p>Thid id thr trext for the next DVE</p>\r\n<p><pi>***LIVE*** </pi></p>\r\n<p><a idref="0"></a></p>\r\n<p><a idref="1"></a></p>\r\n<p><a idref="4"></a></p>\r\n<p><cc>Spib her</cc></p>\r\n<p></p>\r\n\r\n<p>Script here</p>\r\n'
		const cues2 = [['1'], ['2'], null, ['4'], ['5']]

		const result = ParseBody('00000000001', body2, cues2, fields, 0)
		expect(result).toEqual(
			literal<PartDefinition[]>([
				{
					type: PartType.Unknown,
					cues: [],
					script: 'Thid id thr trext for the next DVE\n',
					variant: {},
					externalId: '00000000001-0',
					rawType: '',
					fields: {},
					modified: 0
				},
				{
					type: PartType.Live,
					cues: [['1'], ['2'], ['5']],
					script: 'Script here\n',
					variant: {},
					externalId: '00000000001-1',
					rawType: 'LIVE',
					fields: {},
					modified: 0
				}
			])
		)
	})

	test('test3', () => {
		const body3 =
			'\r\n<p><pi>KAM AR</pi></p>\r\n<p></p>\r\n<p><a idref="0"></a></p>\r\n<p><cc>------vcp digi her-></cc><a idref="8"><cc><----</cc></a></p>\r\n<p></p>\r\n<p>Det blev en turbulent sidste sæson for håndboldtræner Kristian Kristensen i Herning Ikast. Et anstrengt forhold til klubbens ledelse endte med et DM-sølv. Nu venter så nye udfordringer i en ny klub og i en ny liga - for i dag blev præsenteret som assistent i Ribe Esbjerg. </p>\r\n<p></p>\r\n<p>***<pi>SERVER*** </pi></p>\r\n<p><cc>----ss3 Sport LOOP-></cc><a idref="1"><cc><-</cc></a></p>\r\n<p><cc>---bundter herunder---></cc></p>\r\n<p> </p>\r\n<p><a idref="2">   </a></p>\r\n<p><a idref="3"></a></p>\r\n<p> <a idref="4">  </a></p>\r\n<p><a idref="5"></a></p>\r\n<p><a idref="6"></a></p>\r\n<p><a idref="7"></a></p>\r\n<p><pi>SLUTORD: ... ekstra kick</pi></p>\r\n<p></p>\r\n'
		const cues3 = [['1'], ['2'], ['3'], ['4'], ['5'], ['6'], ['7'], ['8'], ['9']]

		const result = ParseBody('00000000001', body3, cues3, fields, 0)
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
					externalId: '00000000001-0',
					fields: {},
					modified: 0
				},
				{
					type: PartType.Server,
					rawType: 'SERVER',
					cues: [['2'], ['3'], ['4'], ['5'], ['6'], ['7'], ['8']],
					script: '',
					variant: {},
					externalId: '00000000001-1',
					fields: {},
					modified: 0
				},
				{
					type: PartType.Unknown,
					rawType: 'SLUTORD: ekstra kick',
					cues: [],
					script: '',
					variant: {},
					externalId: '00000000001-2',
					fields: {},
					modified: 0
				}
			])
		)
	})

	test('test4', () => {
		const body4 =
			"\r\n<p></p>\r\n<p><a idref='0'></a></p>\r\n<p><pi>CAMERA 1</pi></p>\r\n<p>Her står em masse tekst</p>\r\n"
		const cues4 = [['1']]
		const result = ParseBody('00000000001', body4, cues4, fields, 0)
		expect(result).toEqual(
			literal<PartDefinition[]>([
				{
					type: PartType.Unknown,
					rawType: '',
					cues: [['1']],
					script: '',
					variant: {},
					externalId: '00000000001-0',
					fields: {},
					modified: 0
				},
				{
					type: PartType.Kam,
					rawType: 'CAMERA 1',
					cues: [], // TODO: Cue outside part
					script: 'Her står em masse tekst\n',
					variant: {
						name: '1'
					},
					externalId: '00000000001-1',
					fields: {},
					modified: 0
				}
			])
		)
	})

	test('test5', () => {
		const body5 =
			'\r\n<p></p>\r\n<p></p>\r\n<p><pi>KAM 1 </pi></p>\r\n<p><cc>--tlftopt-></cc><a idref="0"><cc><--</cc></a></p>\r\n<p></p>\r\n<p></p>\r\n<p><a idref="1"><pi>************ 100%GRAFIK ***********</pi></a></p>\r\n<p><a idref="4"></a></p>\r\n<p><a idref="3"></a></p>\r\n<p></p>\r\n'
		const cues5 = [['1'], ['2'], ['3'], ['4'], ['5']]
		const result = ParseBody('00000000001', body5, cues5, fields, 0)
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
					externalId: '00000000001-0',
					fields: {},
					modified: 0
				},
				{
					type: PartType.Grafik,
					rawType: '100%GRAFIK',
					cues: [['2'], ['5'], ['4']],
					script: '',
					variant: {},
					externalId: '00000000001-1',
					fields: {},
					modified: 0
				}
			])
		)
	})

	test('test6', () => {
		const body6 =
			'\r\n<p><pi></pi></p>\r\n<p><pi></pi></p>\r\n<p><pi>KAM 1 </pi></p>\r\n<p><cc>--værter-></cc><a idref="0"><cc><--</cc><pi></pi></a></p>\r\n'
		const cues6 = [['1']]
		const result = ParseBody('00000000001', body6, cues6, fields, 0)
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
					externalId: '00000000001-0',
					fields: {},
					modified: 0
				}
			])
		)
	})

	test('test7', () => {
		const body7 =
			'\r\n<p></p>\r\n<p><a idref="0"></a></p>\r\n<p></p>\r\n<p><pi>***ATTACK*** </pi></p>\r\n<p><cc>----ss3 Sport LOOP-></cc><a idref="1"><cc><-</cc></a></p>\r\n<p><cc>---AR DIGI OUT-></cc><a idref="2"><cc><---</cc></a></p>\r\n<p><cc>---bundter herunder---></cc></p>\r\n<p><a idref="3"></a></p>\r\n<p></p>\r\n<p></p>\r\n<p><pi>SLUTORD:... wauw</pi></p>\r\n<p></p>\r\n<p><pi>KAM 4 </pi></p>\r\n<p><pi>NEDLÆG</pi></p>\r\n<p>I morgen holder rytterne hviledag, men det betyder ikke at vores cykelredaktion gør. Vi sender nemlig et program om doping i cykelsporten her på TV 2 kl. 15.20</p>\r\n<p></p>\r\n'
		const cues7 = [['1'], ['2'], ['3'], ['4']]
		const result = ParseBody('00000000001', body7, cues7, fields, 0)
		expect(result).toEqual(
			literal<PartDefinition[]>([
				{
					type: PartType.Unknown,
					rawType: '',
					cues: [['1']],
					script: '',
					variant: {},
					externalId: '00000000001-0',
					fields: {},
					modified: 0
				},
				{
					type: PartType.Unknown,
					rawType: 'ATTACK',
					cues: [['2'], ['3'], ['4']],
					script: '',
					variant: {},
					externalId: '00000000001-1',
					fields: {},
					modified: 0
				},
				{
					type: PartType.Unknown,
					rawType: 'SLUTORD wauw',
					cues: [],
					script: '',
					variant: {},
					externalId: '00000000001-2',
					fields: {},
					modified: 0
				},
				{
					type: PartType.Kam,
					rawType: 'KAM 4',
					cues: [],
					script: '',
					variant: {
						name: '4'
					},
					externalId: '00000000001-3',
					fields: {},
					modified: 0
				},
				{
					type: PartType.Unknown,
					rawType: 'NEDLÆG',
					cues: [],
					script:
						'I morgen holder rytterne hviledag, men det betyder ikke at vores cykelredaktion gør. Vi sender nemlig et program om doping i cykelsporten her på TV 2 kl. 15.20\n',
					variant: {},
					externalId: '00000000001-4',
					fields: {},
					modified: 0
				}
			])
		)
	})

	test('test8', () => {
		const body8 =
			'\r\n<p><cc>HUSK AT BOOKE DENNE LIVE!!</cc></p>\r\n<p><pi>KAM 2</pi></p>\r\n<p><pi>KADA</pi></p>\r\n<p><a idref="0"></a></p>\r\n<p><a idref="1"><a idref="2"></a></a></p>\r\n<p><cc>Husk at skrive bynavn med VERSALER efter "BYNAVN=" og efter "#kg direkte"</cc></p>\r\n<p></p>\r\n<p><a idref="3"> <cc>Kilde til optagelse på select-feed.</cc></a></p>\r\n<p></p>\r\n<p>Divya Das med fra London</p>\r\n<p></p>\r\n<p><pi>***LIVE*** </pi></p>\r\n<p><cc>Husk at lave en BUNDT. Opret den med tidsangivelse x.xx.</cc></p>\r\n<p><a idref="4"></a></p>\r\n<p></p>\r\n<p><pi>- Angela Merkel har accepteret at give Johnson 30 dage til at løse problemet med den såkaldte backstop. Hvordan er den udmelding blevet modtaget i Storbritannien?</pi></p>\r\n<p></p>\r\n<p><pi>- Emmanuel Macron har indtil nu afvist at genforhandle brexit-aftalen. Så hvad skal Boris Johnson have ud af dagens besøg i Paris?</pi></p>\r\n<p></p>\r\n<p><pi>- Hvad skal ændre sig, hvis briterne ikke skal forlade EU uden en aftale den 31. oktober? </pi></p>\r\n<p></p>\r\n'
		const cues8 = [['1'], ['2'], ['3'], ['4'], ['5']]
		const result = ParseBody('00000000001', body8, cues8, fields, 0)
		expect(result).toEqual(
			literal<PartDefinition[]>([
				{
					type: PartType.Kam,
					rawType: 'KAM 2',
					cues: [],
					script: '',
					variant: {
						name: '2'
					},
					externalId: '00000000001-0',
					fields: {},
					modified: 0
				},
				{
					type: PartType.Unknown,
					rawType: 'KADA',
					cues: [['1'], ['2'], ['3'], ['4']],
					script: 'Divya Das med fra London\n',
					variant: {},
					externalId: '00000000001-1',
					fields: {},
					modified: 0
				},
				{
					type: PartType.Live,
					rawType: 'LIVE',
					cues: [['5']],
					script:
						'- Angela Merkel har accepteret at give Johnson 30 dage til at løse problemet med den såkaldte backstop. Hvordan er den udmelding blevet modtaget i Storbritannien?\n- Emmanuel Macron har indtil nu afvist at genforhandle brexit-aftalen. Så hvad skal Boris Johnson have ud af dagens besøg i Paris?\n- Hvad skal ændre sig, hvis briterne ikke skal forlade EU uden en aftale den 31. oktober?\n',
					variant: {},
					externalId: '00000000001-2',
					fields: {},
					modified: 0
				}
			])
		)
	})

	test('test9', () => {
		const body9 =
			'\r\n<p><cc>HUSK AT BOOKE DENNE LIVE!!</cc></p>\r\n<p><pi>KAM 2</pi></p>\r\n<p><a idref="0"></a></p>\r\n<p><a idref="1"><a idref="2"></a></a></p>\r\n<p><cc>Husk at skrive bynavn med VERSALER efter "BYNAVN=" og efter "#kg direkte"</cc></p>\r\n<p></p>\r\n<p><a idref="3"> <cc>Kilde til optagelse på select-feed.</cc></a></p>\r\n<p></p>\r\n<p>Vi har også dig, Kristian Mouritzen, Sikkerhedspolitisk korrespondent på Berlingske med på en forbindelse. </p>\r\n<p></p>\r\n<p>Du har skrevet en analyse af forholdet mellem USA og Danmark efter Trump i et interview kalder Mette Frederiksens kommentare for "nasty". </p>\r\n<p></p>\r\n<p>Nogle politiske analystikere er ude og hylde Mette Frederiksen for sine handlinger, mens andre kalder det usmart. Er det her udelukkende en retorisk armlægningskonkurrence, eller skal vi forvente, at det udskudte besøg også vil få konsekvenser for forholdet mellem Danmark og USA på længere sigt? </p>\r\n<p></p>\r\n<p><pi>***LIVE*** </pi></p>\r\n<p><cc>Husk at lave en BUNDT. Opret den med tidsangivelse x.xx.</cc></p>\r\n<p><a idref="4"></a></p>\r\n<p></p>\r\n<p><pi>Skal vi forvente at Mette Frederiksen vil forsøge at glatte den nuværende konflikt ud, så Trump på et tidspunkt vil genoverveje besøget til Danmark? </pi></p>\r\n<p></p>\r\n<p><pi>Vi har set flere andre politiske ledere agere mindre konfronterende og i stedet være imødekommende, når den amerikanske præsident har været på besøg. Hvad får Mette Frederiksen ud af at bruge en retorik, hvor hun eksempelvis kalder købet af Grønland en "absurd diskussion"? </pi></p>\r\n<p></p>\r\n<p></p>\r\n'
		const cues9 = [['1'], ['2'], ['3'], ['4'], ['5']]
		const result = ParseBody('00000000001', body9, cues9, fields, 0)
		expect(result).toEqual(
			literal<PartDefinition[]>([
				{
					type: PartType.Kam,
					rawType: 'KAM 2',
					cues: [['1'], ['2'], ['3'], ['4']],
					script:
						'Vi har også dig, Kristian Mouritzen, Sikkerhedspolitisk korrespondent på Berlingske med på en forbindelse.\nDu har skrevet en analyse af forholdet mellem USA og Danmark efter Trump i et interview kalder Mette Frederiksens kommentare for "nasty".\nNogle politiske analystikere er ude og hylde Mette Frederiksen for sine handlinger, mens andre kalder det usmart. Er det her udelukkende en retorisk armlægningskonkurrence, eller skal vi forvente, at det udskudte besøg også vil få konsekvenser for forholdet mellem Danmark og USA på længere sigt?\n',
					variant: {
						name: '2'
					},
					externalId: '00000000001-0',
					fields: {},
					modified: 0
				},
				{
					type: PartType.Live,
					rawType: 'LIVE',
					cues: [['5']],
					script:
						'Skal vi forvente at Mette Frederiksen vil forsøge at glatte den nuværende konflikt ud, så Trump på et tidspunkt vil genoverveje besøget til Danmark?\nVi har set flere andre politiske ledere agere mindre konfronterende og i stedet være imødekommende, når den amerikanske præsident har været på besøg. Hvad får Mette Frederiksen ud af at bruge en retorik, hvor hun eksempelvis kalder købet af Grønland en "absurd diskussion"?\n',
					variant: {},
					externalId: '00000000001-1',
					fields: {},
					modified: 0
				}
			])
		)
	})

	// TODO: If any users complain of missing bullet points after cameras, here's your culprit.
	test('test10', () => {
		const body10 =
			'\r\n<p><cc>HUSK AT BOOKE DENNE LIVE!!</cc></p>\r\n<p><pi>KAM 2</pi></p>\r\n<p><a idref="0"></a></p>\r\n<p><a idref="1"><a idref="2"></a></a></p>\r\n<p><cc>Husk at skrive bynavn med VERSALER efter "BYNAVN=" og efter "#kg direkte"</cc></p>\r\n<p></p>\r\n<p><a idref="3"> <cc>Kilde til optagelse på select-feed.</cc></a></p>\r\n<p>Som lovet -med os igen har vi nu </p>\r\n<p>Udenrigsminister Jeppe Kofod. </p>\r\n<p></p>\r\n<p>Trump valgte at aflyse besøget i danmark - og igår aftes førte det til, at du havde en samtale med den amerikanske udenrigsminster Mike Pompeo. Hvorfor talte i sammen?</p>\r\n<p></p>\r\n<p><pi>Hvordan forholdt den amerikanske udenrigsminster sig til den diplomatiske diskussion der er opstået?</pi></p>\r\n<p></p>\r\n<p><pi>Hvordan ser i på det nuværende forhold mellem USA og Danmark?</pi></p>\r\n<p></p>\r\n<p><pi>***LIVE*** </pi></p>\r\n<p><cc>Husk at lave en BUNDT. Opret den med tidsangivelse x.xx.</cc></p>\r\n<p><a idref="4"></a></p>\r\n<p><pi>Hvordan kan et godt fortsat strategisk samarbejde fortsætte, når Trump langer ud efter Danmark og drager forsvarsbudgettet ind i diskussionen?</pi></p>\r\n<p></p>\r\n<p><pi>Er amerikanerne med Trump i spidsen fortsat interessedeed i at komme på besøg - Trump skrev selv at hans besøg blot var udsat - ikke aflyst?</pi></p>\r\n<p></p>\r\n<p><cc>Aftalen er at vi spørger til hans reaktion på aflysningen og hvad han mener dette betyder både ift DKs forhold til USA og til Grønland. </cc></p>\r\n<p><cc>Og har også varslet at vi vil spørge til det faktum at Trump har "udsat" besøget og ikke aflyst det. Så hvor langt er de nået ift at finde en ny dato?</cc></p>\r\n<p><cc></cc></p>\r\n'
		const cues10 = [['1'], ['2'], ['3'], ['4'], ['5']]
		const result = ParseBody('00000000001', body10, cues10, fields, 0)
		expect(result).toEqual(
			literal<PartDefinition[]>([
				{
					type: PartType.Kam,
					rawType: 'KAM 2',
					cues: [['1'], ['2'], ['3'], ['4']],
					script:
						'Som lovet -med os igen har vi nu\nUdenrigsminister Jeppe Kofod.\nTrump valgte at aflyse besøget i danmark - og igår aftes førte det til, at du havde en samtale med den amerikanske udenrigsminster Mike Pompeo. Hvorfor talte i sammen?\n',
					variant: {
						name: '2'
					},
					externalId: '00000000001-0',
					fields: {},
					modified: 0
				},
				{
					type: PartType.Unknown,
					rawType:
						'Hvordan forholdt den amerikanske udenrigsminster sig til den diplomatiske diskussion der er opstået?',
					cues: [],
					script: '',
					variant: {},
					externalId: '00000000001-1',
					fields: {},
					modified: 0
				},
				{
					type: PartType.Unknown,
					rawType: 'Hvordan ser i på det nuværende forhold mellem USA og Danmark?',
					cues: [],
					script: '',
					variant: {},
					externalId: '00000000001-2',
					fields: {},
					modified: 0
				},
				{
					type: PartType.Live,
					rawType: 'LIVE',
					cues: [['5']],
					script:
						'Hvordan kan et godt fortsat strategisk samarbejde fortsætte, når Trump langer ud efter Danmark og drager forsvarsbudgettet ind i diskussionen?\nEr amerikanerne med Trump i spidsen fortsat interessedeed i at komme på besøg - Trump skrev selv at hans besøg blot var udsat - ikke aflyst?\n',
					variant: {},
					externalId: '00000000001-3',
					fields: {},
					modified: 0
				}
			])
		)
	})

	test('test11', () => {
		const body11 =
			'\r\n<p><pi>KAM 1</pi></p>\r\n<p></p>\r\n<p>Samtalen mellem udenrigsminister Jeppe Kofod og hans amerikanske kollega Mike Pompeo kommer, efter Donald Trump i går langede ud efter Mette Frederiksen.</p>\r\n<p><a idref="0"></a></p>\r\n<p><pi>***VO***</pi></p>\r\n<p><a idref="1"></a></p>\r\n<p><pi><b>SB: Trump: I looked forward to going, but I thought that the prime minister\'s statement that it was an absurd idea was nasty, and I thought it was an inappropriate statement. (10 sek)</b></pi></p>\r\n<p><a idref="2"></a></p>\r\n<p>Mette Frederiksen sagde søndag til DR, at diskussionen om at sælge Grønland er \'absurd\', og det er dét, der er faldet Trump for brystet. </p>\r\n<p></p>\r\n<p>Senere på aftenen fortsatte Donald Trump sin kritik af Danmark på Twitter:</p>\r\n<p></p>\r\n<p>Ifølge præsidenten burde Danmark bruge langt flere penge på forsvar - og dermed bidrage mere til forsvarsalliancen NATO. </p>\r\n<p></p>\r\n<p><cc>GR Trump NATO</cc></p>\r\n<p><cc>GR Løkke NATO</cc></p>\r\n<p></p>\r\n'
		const cues11 = [['1'], ['2'], ['3']]
		const result = ParseBody('00000000001', body11, cues11, fields, 0)
		expect(result).toEqual(
			literal<PartDefinition[]>([
				{
					type: PartType.Kam,
					rawType: 'KAM 1',
					cues: [['1']],
					script:
						'Samtalen mellem udenrigsminister Jeppe Kofod og hans amerikanske kollega Mike Pompeo kommer, efter Donald Trump i går langede ud efter Mette Frederiksen.\n',
					variant: {
						name: '1'
					},
					externalId: '00000000001-0',
					fields: {},
					modified: 0
				},
				{
					type: PartType.VO,
					rawType: 'VO',
					cues: [['2']],
					script: '',
					variant: {},
					externalId: '00000000001-1',
					fields: {},
					modified: 0
				},
				{
					type: PartType.Unknown,
					rawType:
						"SB: Trump: I looked forward to going, but I thought that the prime minister's statement that it was an absurd idea was nasty, and I thought it was an inappropriate statement. 10 sek)",
					cues: [['3']],
					script:
						"Mette Frederiksen sagde søndag til DR, at diskussionen om at sælge Grønland er 'absurd', og det er dét, der er faldet Trump for brystet.\nSenere på aftenen fortsatte Donald Trump sin kritik af Danmark på Twitter:\nIfølge præsidenten burde Danmark bruge langt flere penge på forsvar - og dermed bidrage mere til forsvarsalliancen NATO.\n",
					variant: {},
					externalId: '00000000001-2',
					fields: {},
					modified: 0
				}
			])
		)
	})

	test('test12', () => {
		const body12 =
			'\r\n<p><cc>Hvad er vinklen på dette interview: Trumps brug af sociale medier er unikke for en amerikansk præsident.</cc></p>\r\n<p></p>\r\n<p></p>\r\n<p><pi>KAM 3</pi></p>\r\n<p></p>\r\n<p><a idref="0"><cc> GÆSTEBAGGRUND</cc></a></p>\r\n<p></p>\r\n<p><a idref="1"> <cc>Kilde til optagelse på select-feed. </cc></a></p>\r\n<p></p>\r\n<p><cc>Manus herunder:</cc></p>\r\n<p></p>\r\n<p>Og så kan vi byde velkommen til Kaare Sørensen, digital udviklingsredaktør her på TV 2 og tidligere USA-korrespondent. </p>\r\n<p></p>\r\n<p>Du har fulgt Trumps brug af sociale medier og herunder særligt præsidentens brug af Twitter. Hvad kendetegner Donald Trumps brug af sociale medier? </p>\r\n<p></p>\r\n<p><pi>***LIVE*** </pi></p>\r\n<p><cc>Husk at lave en BUNDT. Opret den med tidsangivelse x.xx.</cc></p>\r\n<p>.</p>\r\n<p></p>\r\n<p><pi>Hvis vi kigger specifikt på Twitter, hvordan skiller Trump sig ud fra tidligere præsidenter, når det kommer til brugen af det her? </pi></p>\r\n<p></p>\r\n<p><pi>Hvad får præsidenten ud af den her adfærd på de sociale medier?</pi></p>\r\n<p></p>\r\n<p><pi>Har han en særlig strategi med den her måde at bruge twitter på? </pi></p>\r\n<p></p>\r\n<p><pi>Vi har med en præsident at gøre, der konstant laver overskrifter med brugen af sociale medier. Hvad det, der gør, at medier over hele kloden bliver ved med at beskæftige sig med de her tweets? </pi></p>\r\n<p></p>\r\n<p><a idref="2"></a></p>\r\n<p></p>\r\n'
		const cues12 = [['1'], ['2'], ['3']]
		const result = ParseBody('00000000001', body12, cues12, fields, 0)
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
					externalId: '00000000001-0',
					fields: {},
					modified: 0
				},
				{
					type: PartType.Live,
					rawType: 'LIVE',
					cues: [['3']],
					script:
						'.\nHvis vi kigger specifikt på Twitter, hvordan skiller Trump sig ud fra tidligere præsidenter, når det kommer til brugen af det her?\nHvad får præsidenten ud af den her adfærd på de sociale medier?\nHar han en særlig strategi med den her måde at bruge twitter på?\nVi har med en præsident at gøre, der konstant laver overskrifter med brugen af sociale medier. Hvad det, der gør, at medier over hele kloden bliver ved med at beskæftige sig med de her tweets?\n',
					variant: {},
					externalId: '00000000001-1',
					fields: {},
					modified: 0
				}
			])
		)
	})

	test('test13', () => {
		const body13 =
			'\r\n<p><a idref="0"></a></p>\r\n<p></p>\r\n<p></p>\r\n<p></p>\r\n<p></p>\r\n<p></p>\r\n<p></p>\r\n<p></p>\r\n<p></p>\r\n<p></p>\r\n<p></p>\r\n<p></p>\r\n<p></p>\r\n<p></p>\r\n<p></p>\r\n'
		const cues13 = [['1']]
		const result = ParseBody('00000000001', body13, cues13, fields, 0)
		expect(result).toEqual(
			literal<PartDefinition[]>([
				{
					type: PartType.Unknown,
					rawType: '',
					cues: [['1']],
					script: '',
					variant: {},
					externalId: '00000000001-0',
					fields: {},
					modified: 0
				}
			])
		)
	})

	test('test14', () => {
		const body14 =
			'\r\n<p></p>\r\n<p><a idref="0"></a></p>\r\n<p>Rasmus Staghøj, således reaktioner fra Astana-lejren, men hvordan bliver der ellers talt om det her nede hos jer?</p>\r\n<p><pi>***LIVE*** </pi></p>\r\n<p><a idref="1"></a></p>\r\n<p><a idref="2"></a></p>\r\n<p><a idref="3"></a></p>\r\n<p><a idref="4"></a></p>\r\n<p><a idref="5"><tab><tab><tab></tab></tab></tab></a></p>\r\n<p></p>\r\n'
		const cues14 = [['1'], ['2'], ['3'], ['4'], ['5'], ['6']]
		const result = ParseBody('00000000001', body14, cues14, fields, 0)
		expect(result).toEqual(
			literal<PartDefinition[]>([
				{
					type: PartType.Unknown,
					rawType: '',
					cues: [['1']],
					script:
						'Rasmus Staghøj, således reaktioner fra Astana-lejren, men hvordan bliver der ellers talt om det her nede hos jer?\n',
					variant: {},
					externalId: '00000000001-0',
					fields: {},
					modified: 0
				},
				{
					type: PartType.Live,
					rawType: 'LIVE',
					cues: [['2'], ['3'], ['4'], ['5'], ['6']],
					script: '',
					variant: {},
					externalId: '00000000001-1',
					fields: {},
					modified: 0
				}
			])
		)
	})
})
