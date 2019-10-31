import { literal } from '../../../../common/util'
import {
	ParseBody,
	PartDefinition,
	PartDefinitionKam,
	PartDefinitionServer,
	PartDefinitionSlutord,
	PartDefinitionUnknown,
	PartDefinitionVO,
	PartType
} from '../ParseBody'
import {
	CueDefinitionEkstern,
	CueDefinitionGrafik,
	CueDefinitionJingle,
	CueDefinitionTelefon,
	CueDefinitionUnknown,
	CueType,
	UnparsedCue,
	CueDefinition
} from '../ParseCue'

const fields = {}

const cueUnknown: CueDefinitionUnknown = {
	type: CueType.Unknown
}

const unparsedUnknown: UnparsedCue = ['Some invalid cue']

const cueGrafik1: CueDefinitionGrafik = {
	type: CueType.Grafik,
	template: 'bund',
	textFields: ['1']
}

const unparsedGrafik1 = ['kg bund 1']

const cueGrafik2: CueDefinitionGrafik = {
	type: CueType.Grafik,
	template: 'bund',
	textFields: ['2']
}

const unparsedGrafik2 = ['kg bund 2']

const cueGrafik3: CueDefinitionGrafik = {
	type: CueType.Grafik,
	template: 'bund',
	textFields: ['3']
}

const unparsedGrafik3 = ['kg bund 3']

const cueEkstern1: CueDefinitionEkstern = {
	type: CueType.Ekstern,
	source: '1'
}

const unparsedEkstern1 = ['EKSTERN=1']

const cueEkstern2: CueDefinitionEkstern = {
	type: CueType.Ekstern,
	source: '2'
}

const unparsedEkstern2 = ['EKSTERN=2']

const cueJingle1: CueDefinitionJingle = {
	type: CueType.Jingle,
	clip: '1'
}

const unparsedJingle1 = ['JINGLE2=1']

const cueJingle2: CueDefinitionJingle = {
	type: CueType.Jingle,
	clip: '2'
}

const unparsedJingle2 = ['JINGLE2=2']

const cueJingle3: CueDefinitionJingle = {
	type: CueType.Jingle,
	clip: '3'
}

const unparsedJingle3 = ['JINGLE2=3']

const cueTelefon1: CueDefinitionTelefon = {
	type: CueType.Telefon,
	source: 'TLF 1'
}

const unparsedTelefon1 = ['TELEFON=TLF 1']

const cueTelefon2: CueDefinitionTelefon = {
	type: CueType.Telefon,
	source: 'TLF 2'
}

const unparsedTelefon2 = ['TELEFON=TLF 2']

describe('Body parser', () => {
	test('test1', () => {
		const body1 =
			'\r\n<p></p>\r\n<p><pi>*****TEKNIK*****</pi></p>\r\n<p><cc>1---JINGLE sport grafisk intro---></cc><a idref="0"><cc><----</cc></a></p>\r\n<p><cc>2---AUDIO til grafisk intro , fortsætter under teasere---></cc><a idref="1"><cc><----</cc></a></p>\r\n<p><cc>3---SS3 Sport WIPE-></cc><a idref="2"></a></p>\r\n<p><cc>4---Sport intro soundbed--></cc><a idref="3"><cc><---</cc></a></p>\r\n<p><cc>5---LED hvid på GENESIS--></cc><a idref="4"><cc><--</cc></a></p>\r\n<p><cc>6---SS3 Sport WIPE-></cc><a idref="5"></a></p>\r\n<p><cc>7---LYS:  SPORT 1 --></cc><a idref="6"><cc><--</cc></a></p>\r\n<p><cc>8---Kalder Viz Wall og kalder inputs-----</cc><a idref="7"><cc>------</cc></a></p>\r\n<p><cc>9---VCP STILL DIGI her-></cc><a idref="8"><cc><---</cc></a></p>\r\n<p></p>\r\n'
		const cues1 = [
			unparsedUnknown,
			unparsedGrafik1,
			unparsedGrafik2,
			unparsedGrafik3,
			unparsedEkstern1,
			unparsedEkstern2,
			unparsedJingle1,
			unparsedJingle2,
			unparsedJingle3
		]

		const result = ParseBody('00000000001', '', body1, cues1, fields, 0)
		expect(result).toEqual(
			literal<PartDefinition[]>([
				{
					type: PartType.Teknik,
					cues: [
						cueUnknown,
						cueGrafik1,
						cueGrafik2,
						cueGrafik3,
						cueEkstern1,
						cueEkstern2,
						cueJingle1,
						cueJingle2,
						cueJingle3
					],
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
		const cues2 = [unparsedUnknown, unparsedGrafik1, null, unparsedGrafik3, unparsedEkstern1]

		const result = ParseBody('00000000001', '', body2, cues2, fields, 0)
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
					cues: [cueUnknown, cueGrafik1, cueEkstern1],
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
		const cues3 = [
			unparsedUnknown,
			unparsedGrafik1,
			unparsedGrafik2,
			unparsedGrafik3,
			unparsedEkstern1,
			unparsedEkstern2,
			unparsedJingle1,
			unparsedJingle2,
			unparsedJingle3
		]

		const result = ParseBody('00000000001', '', body3, cues3, fields, 0)
		expect(result).toEqual(
			literal<PartDefinition[]>([
				{
					type: PartType.Kam,
					rawType: 'KAM AR',
					cues: [cueUnknown, cueJingle3],
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
					cues: [cueGrafik1, cueGrafik2, cueGrafik3, cueEkstern1, cueEkstern2, cueJingle1, cueJingle2],
					script: '',
					variant: {},
					externalId: '00000000001-1',
					fields: {},
					modified: 0
				},
				{
					type: PartType.Slutord,
					rawType: 'SLUTORD: ekstra kick',
					cues: [],
					script: '',
					variant: {
						endWords: 'ekstra kick'
					},
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
		const cues4 = [unparsedUnknown]
		const result = ParseBody('00000000001', '', body4, cues4, fields, 0)
		expect(result).toEqual(
			literal<PartDefinition[]>([
				{
					type: PartType.Unknown,
					rawType: '',
					cues: [cueUnknown],
					script: '',
					variant: {},
					externalId: '00000000001-0',
					fields: {},
					modified: 0
				},
				{
					type: PartType.Kam,
					rawType: 'CAMERA 1',
					cues: [],
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
		const cues5 = [unparsedUnknown, unparsedGrafik1, unparsedGrafik2, unparsedGrafik3, unparsedEkstern1]
		const result = ParseBody('00000000001', '', body5, cues5, fields, 0)
		expect(result).toEqual(
			literal<PartDefinition[]>([
				{
					type: PartType.Kam,
					rawType: 'KAM 1',
					cues: [cueUnknown], // TODO: There should be another cue
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
					cues: [cueGrafik1, cueEkstern1, cueGrafik3],
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
		const cues6 = [unparsedUnknown]
		const result = ParseBody('00000000001', '', body6, cues6, fields, 0)
		expect(result).toEqual(
			literal<PartDefinition[]>([
				{
					type: PartType.Kam,
					rawType: 'KAM 1',
					cues: [cueUnknown],
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
		const cues7 = [unparsedUnknown, unparsedGrafik1, unparsedGrafik2, unparsedGrafik3]
		const result = ParseBody('00000000001', '', body7, cues7, fields, 0)
		expect(result).toEqual(
			literal<PartDefinition[]>([
				{
					type: PartType.Unknown,
					rawType: '',
					cues: [cueUnknown],
					script: '',
					variant: {},
					externalId: '00000000001-0',
					fields: {},
					modified: 0
				},
				{
					type: PartType.Unknown,
					rawType: 'ATTACK',
					cues: [cueGrafik1, cueGrafik2, cueGrafik3],
					script: '',
					variant: {},
					externalId: '00000000001-1',
					fields: {},
					modified: 0
				},
				{
					type: PartType.Slutord,
					rawType: 'SLUTORD wauw',
					cues: [],
					script: '',
					variant: {
						endWords: 'wauw'
					},
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
		const cues8 = [unparsedUnknown, unparsedGrafik1, unparsedGrafik2, unparsedGrafik3, unparsedEkstern1]
		const result = ParseBody('00000000001', '', body8, cues8, fields, 0)
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
					cues: [cueUnknown, cueGrafik1, cueGrafik2, cueGrafik3],
					script: 'Divya Das med fra London\n',
					variant: {},
					externalId: '00000000001-1',
					fields: {},
					modified: 0
				},
				{
					type: PartType.Live,
					rawType: 'LIVE',
					cues: [cueEkstern1],
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
		const cues9 = [unparsedUnknown, unparsedGrafik1, unparsedGrafik2, unparsedGrafik3, unparsedEkstern1]
		const result = ParseBody('00000000001', '', body9, cues9, fields, 0)
		expect(result).toEqual(
			literal<PartDefinition[]>([
				{
					type: PartType.Kam,
					rawType: 'KAM 2',
					cues: [cueUnknown, cueGrafik1, cueGrafik2, cueGrafik3],
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
					cues: [cueEkstern1],
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
		const cues10 = [unparsedUnknown, unparsedGrafik1, unparsedGrafik2, unparsedGrafik3, unparsedEkstern1]
		const result = ParseBody('00000000001', '', body10, cues10, fields, 0)
		expect(result).toEqual(
			literal<PartDefinition[]>([
				{
					type: PartType.Kam,
					rawType: 'KAM 2',
					cues: [cueUnknown, cueGrafik1, cueGrafik2, cueGrafik3],
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
					cues: [cueEkstern1],
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
		const cues11 = [unparsedUnknown, unparsedGrafik1, unparsedGrafik2]
		const result = ParseBody('00000000001', '', body11, cues11, fields, 0)
		expect(result).toEqual(
			literal<PartDefinition[]>([
				{
					type: PartType.Kam,
					rawType: 'KAM 1',
					cues: [cueUnknown],
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
					cues: [cueGrafik1],
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
					cues: [cueGrafik2],
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
		const cues12 = [unparsedUnknown, unparsedGrafik1, unparsedGrafik2]
		const result = ParseBody('00000000001', '', body12, cues12, fields, 0)
		expect(result).toEqual(
			literal<PartDefinition[]>([
				{
					type: PartType.Kam,
					rawType: 'KAM 3',
					cues: [cueUnknown, cueGrafik1],
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
					cues: [cueGrafik2],
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
		const cues13 = [unparsedUnknown]
		const result = ParseBody('00000000001', '', body13, cues13, fields, 0)
		expect(result).toEqual(
			literal<PartDefinition[]>([
				{
					type: PartType.Unknown,
					rawType: '',
					cues: [cueUnknown],
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
		const cues14 = [
			unparsedUnknown,
			unparsedGrafik1,
			unparsedGrafik2,
			unparsedGrafik3,
			unparsedEkstern1,
			unparsedEkstern2
		]
		const result = ParseBody('00000000001', '', body14, cues14, fields, 0)
		expect(result).toEqual(
			literal<PartDefinition[]>([
				{
					type: PartType.Unknown,
					rawType: '',
					cues: [cueUnknown],
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
					cues: [cueGrafik1, cueGrafik2, cueGrafik3, cueEkstern1, cueEkstern2],
					script: '',
					variant: {},
					externalId: '00000000001-1',
					fields: {},
					modified: 0
				}
			])
		)
	})

	test('test15', () => {
		const body15 =
			'\r\n<p><cc>---JINGLE sport grafisk intro---></cc><a idref="0"><cc><----</cc></a></p>\r\n<p></p>\r\n<p><cc>---AUDIO til grafisk intro , fortsætter under teasere---></cc><a idref="2"><cc><----</cc></a></p>\r\n<p><a idref="1"></a></p>\r\n'
		const cues15 = [unparsedUnknown, unparsedGrafik1]
		const result = ParseBody('00000000001', 'INTRO', body15, cues15, fields, 0)
		expect(result).toEqual(
			literal<PartDefinition[]>([
				{
					type: PartType.INTRO,
					rawType: 'INTRO',
					cues: [cueUnknown, cueGrafik1],
					script: '',
					variant: {},
					externalId: '00000000001-0',
					fields: {},
					modified: 0
				}
			])
		)
	})

	test('test16', () => {
		const body16 =
			'\r\n<p><a idref="0"><pi>KAM 2</pi></a></p>\r\n<p><cc>Husk at lave en DIGI=trompet</cc></p>\r\n<p><cc>OBS: Udfyld kun linje </cc></p>\r\n<p></p>\r\n<p></p>\r\n<p>Hallo, I wnat to tell you......</p>\r\n<p></p>\r\n<p></p>\r\n<p><a idref="1"></a></p>\r\n<p><pi>***SERVER*** </pi></p>\r\n<p></p>\r\n<p><a idref="2"><a idref="3"><a idref="4"><a idref="5"></a></a></a></a></p>\r\n<p><cc>---SS3 19 NYH LOOP--></cc><a idref="6"><cc><----</cc></a></p>\r\n<p></p>\r\n<p></p>\r\n<p><cc>---<b>BUNDTER HERUNDER</b> ---></cc></p>\r\n<p><pi>KAM 2</pi></p>\r\n<p></p>\r\n<p></p>\r\n<p></p>\r\n<p></p>\r\n<p></p>\r\n<p></p>\r\n<p></p>\r\n<p></p>\r\n<p><pi>SLUTORD:</pi></p>\r\n<p></p>\r\n<p><pi>KAM 2</pi></p>\r\n<p><cc>SLET KAMERA HVIS INGEN NEDLÆG</cc></p>\r\n<p></p>\r\n'
		const cues16 = [
			unparsedUnknown,
			unparsedGrafik1,
			unparsedGrafik2,
			unparsedGrafik3,
			unparsedJingle1,
			unparsedJingle2,
			unparsedJingle3
		]
		const result = ParseBody('00000000001', '', body16, cues16, fields, 0)
		expect(result).toEqual(
			literal<PartDefinition[]>([
				literal<PartDefinitionKam>({
					externalId: '00000000001-0',
					type: PartType.Kam,
					rawType: 'KAM 2',
					script: 'Hallo, I wnat to tell you......\n',
					variant: {
						name: '2'
					},
					cues: [cueUnknown, cueGrafik1],
					fields,
					modified: 0
				}),
				literal<PartDefinitionServer>({
					externalId: '00000000001-1',
					type: PartType.Server,
					rawType: 'SERVER',
					script: '',
					variant: {},
					cues: [cueGrafik2, cueGrafik3, cueJingle1, cueJingle2, cueJingle3],
					fields,
					modified: 0
				}),
				literal<PartDefinitionKam>({
					externalId: '00000000001-2',
					type: PartType.Kam,
					rawType: 'KAM 2',
					script: '',
					variant: {
						name: '2'
					},
					cues: [],
					fields,
					modified: 0
				}),
				literal<PartDefinitionSlutord>({
					externalId: '00000000001-3',
					type: PartType.Slutord,
					rawType: 'SLUTORD:',
					script: '',
					variant: {
						endWords: ''
					},
					cues: [],
					fields,
					modified: 0
				}),
				literal<PartDefinitionKam>({
					externalId: '00000000001-4',
					type: PartType.Kam,
					rawType: 'KAM 2',
					script: '',
					variant: {
						name: '2'
					},
					cues: [],
					fields,
					modified: 0
				})
			])
		)
	})

	test('test17', () => {
		const body17 =
			'\r\n<p></p>\r\n<p><a idref="1"></a></p>\r\n<p><a idref="2"><pi>KAM 1</pi></a></p>\r\n<p></p>\r\n<p>Siden nytår er over 100 mennesker kommet til skade på et el-løbehjul i Københavnsområdet.</p>\r\n<p></p>\r\n<p>Det fremgår af en opgørelse fra Region Hovedstaden, hvor enten akutmodtagelsen eller en ambulance har været involveret i en løbehjuls-skade. </p>\r\n<p></p>\r\n<p>De gange, hvor det er gået galt, er der typisk tale om ansigtsskader, og det er især gået ud over dem i alderen 18 til 25 år:</p>\r\n<p></p>\r\n<p></p>\r\n<p><pi>***SERVER*** </pi></p>\r\n<p></p>\r\n<p><a idref="4"></a></p>\r\n<p><a idref="5"></a></p>\r\n<p><a idref="6"></a></p>\r\n<p><a idref="7"></a></p>\r\n<p><a idref="8"></a></p>\r\n<p><a idref="9"></a></p>\r\n<p><a idref="10"></a></p>\r\n<p></p>\r\n<p><pi>SLUTORD:</pi></p>\r\n<p></p>\r\n<p><pi>Slutord:... Skarpere regler.</pi></p>\r\n<p></p>\r\n<p><pi>KAM 2</pi></p>\r\n<p></p>\r\n<p>Transportminister Benny Engelbrecht siger at han afventer den igangværende evaluering, der er færdig i januar 2020. Herefter vil han sammen med de andre partiet vurdere, om noget skal ændres i forsøgsordningen.</p>\r\n<p></p>\r\n'
		const cues17 = [
			unparsedUnknown,
			unparsedEkstern1,
			unparsedEkstern2,
			unparsedGrafik1,
			unparsedGrafik2,
			unparsedGrafik3,
			unparsedJingle1,
			unparsedJingle2,
			unparsedJingle3,
			unparsedTelefon1,
			unparsedTelefon2
		]
		const result = ParseBody('00000000001', '', body17, cues17, fields, 0)
		expect(result).toEqual(
			literal<PartDefinition[]>([
				literal<PartDefinitionUnknown>({
					externalId: '00000000001-0',
					type: PartType.Unknown,
					variant: {},
					rawType: '',
					cues: [cueEkstern1],
					script: '',
					fields,
					modified: 0
				}),
				literal<PartDefinitionKam>({
					externalId: '00000000001-1',
					type: PartType.Kam,
					variant: {
						name: '1'
					},
					rawType: 'KAM 1',
					cues: [cueEkstern2],
					script:
						'Siden nytår er over 100 mennesker kommet til skade på et el-løbehjul i Københavnsområdet.\nDet fremgår af en opgørelse fra Region Hovedstaden, hvor enten akutmodtagelsen eller en ambulance har været involveret i en løbehjuls-skade.\nDe gange, hvor det er gået galt, er der typisk tale om ansigtsskader, og det er især gået ud over dem i alderen 18 til 25 år:\n',
					fields,
					modified: 0
				}),
				literal<PartDefinitionServer>({
					externalId: '00000000001-2',
					type: PartType.Server,
					variant: {},
					rawType: 'SERVER',
					cues: [cueGrafik2, cueGrafik3, cueJingle1, cueJingle2, cueJingle3, cueTelefon1, cueTelefon2],
					script: '',
					fields,
					modified: 0
				}),
				literal<PartDefinitionSlutord>({
					externalId: '00000000001-3',
					type: PartType.Slutord,
					variant: {
						endWords: ''
					},
					rawType: 'SLUTORD:',
					cues: [],
					script: '',
					fields,
					modified: 0
				}),
				literal<PartDefinitionSlutord>({
					externalId: '00000000001-4',
					type: PartType.Slutord,
					variant: {
						endWords: 'Skarpere regler.'
					},
					rawType: 'Slutord Skarpere regler.',
					cues: [],
					script: '',
					fields,
					modified: 0
				}),
				literal<PartDefinitionKam>({
					externalId: '00000000001-5',
					type: PartType.Kam,
					variant: {
						name: '2'
					},
					rawType: 'KAM 2',
					cues: [],
					script:
						'Transportminister Benny Engelbrecht siger at han afventer den igangværende evaluering, der er færdig i januar 2020. Herefter vil han sammen med de andre partiet vurdere, om noget skal ændres i forsøgsordningen.\n',
					fields,
					modified: 0
				})
			])
		)
	})

	test('test18', () => {
		const body18 =
			'\r\n<p><pi>***VO EFFEKT 0*** </pi></p>\r\n<p><a idref="0"></a></p>\r\n<p>Danmarks udenrigsminister Jeppe Kofod talte i går aftes i telefon med sin amerikanske kollega, Mike Pompeo. De to diskuterede blandt andet Grønland. </p>\r\n<p></p>\r\n'
		const cues18 = [unparsedGrafik1]
		const result = ParseBody('00000000001', '', body18, cues18, fields, 0)
		expect(result).toEqual(
			literal<PartDefinition[]>([
				literal<PartDefinitionVO>({
					externalId: '00000000001-0',
					type: PartType.VO,
					variant: {},
					effekt: 0,
					rawType: 'VO',
					cues: [cueGrafik1],
					script:
						'Danmarks udenrigsminister Jeppe Kofod talte i går aftes i telefon med sin amerikanske kollega, Mike Pompeo. De to diskuterede blandt andet Grønland.\n',
					fields,
					modified: 0
				})
			])
		)
	})

	test('test19', () => {
		const body19 =
			'\r\n<p></p>\r\n<p><pi>KAM 1 EFFEKT 1</pi></p>\r\n<p>Dette er takst</p>\r\n<p></p>\r\n<p><pi>SERVER</pi></p>\r\n<p><a idref="0"></a></p>\r\n<p><a idref="1"></a></p>\r\n<p>STORT BILLEDE AF STUDIE</p>\r\n<p></p>\r\n'
		const cues19 = [unparsedGrafik1, unparsedGrafik2]
		const result = ParseBody('00000000001', '', body19, cues19, fields, 0)
		expect(result).toEqual(
			literal<PartDefinition[]>([
				literal<PartDefinitionKam>({
					externalId: '00000000001-0',
					type: PartType.Kam,
					variant: {
						name: '1'
					},
					effekt: 1,
					rawType: 'KAM 1',
					cues: [],
					script: 'Dette er takst\n',
					fields,
					modified: 0
				}),
				literal<PartDefinitionServer>({
					externalId: '00000000001-1',
					type: PartType.Server,
					variant: {},
					rawType: 'SERVER',
					cues: [cueGrafik1, cueGrafik2],
					script: 'STORT BILLEDE AF STUDIE\n',
					fields,
					modified: 0
				})
			])
		)
	})

	test('test20', () => {
		const body20 =
			'\r\n<p><cc>OBS: der skal være 2 primære templates mellem 2 breakere</cc></p>\r\n<p><pi>K2 NBA18_LEAD_OUT</pi></p>\r\n<p><a idref="0"></a></p>\r\n<p></p>\r\n<p><tab><tab><tab><tab><tab><tab></tab></tab></tab></tab></tab></tab></p>\r\n<p></p>\r\n'
		const cues20 = [unparsedJingle1]
		const result = ParseBody('00000000001', '', body20, cues20, fields, 0)
		expect(result).toEqual(
			literal<PartDefinition[]>([
				literal<PartDefinitionUnknown>({
					externalId: '00000000001-0',
					type: PartType.Unknown,
					variant: {},
					rawType: 'K2 NBA18_LEAD_OUT',
					cues: [cueJingle1],
					script: '',
					fields,
					modified: 0
				})
			])
		)
	})

	test('test21', () => {
		const body21 =
			'\r\n<p><a idref="0"><pi>KAM 2</pi></a></p>\r\n<p><cc>Husk at lave en DIGI=trompet</cc></p>\r\n<p><cc>OBS: Udfyld kun linje </cc></p>\r\n<p></p>\r\n<p></p>\r\n<p>Hallo, I wnat to tell you......</p>\r\n<p>HEREEEELLLLOOOK</p>\r\n<p>YES</p>\r\n<p><a idref="1"></a></p>\r\n<p><pi>***SERVER*** </pi></p>\r\n<p></p>\r\n<p><a idref="2"><a idref="3"><a idref="4"><a idref="5"></a></a></a></a></p>\r\n<p><cc>---SS3 19 NYH LOOP--></cc><a idref="6"><cc><----</cc></a></p>\r\n<p></p>\r\n<p></p>\r\n<p><cc>---<b>BUNDTER HERUNDER</b> ---></cc></p>\r\n<p><pi>KAM 1</pi></p>\r\n<p></p>\r\n<p></p>\r\n<p><pi>KAM 1</pi></p>\r\n<p></p>\r\n<p></p>\r\n<p><pi>SLUTORD:</pi></p>\r\n<p></p>\r\n<p><pi>KAM 1</pi></p>\r\n<p><cc>SLET KAMERA HVIS INGEN NEDLÆG</cc></p>\r\n<p></p>\r\n'
		const cues21 = [
			null,
			null,
			null,
			['kg ident_blank', 'ODENSE', 'KLJ', ';x.xx'],
			['kg bund ANETTE RYTTER', 'Inews', ';x.xx'],
			['kg bund ANETTE RYTTER', 'anry@tv2.dk', ';x.xx'],
			['SS=3-NYH-19-LOOP', ';0.01']
		]
		const result = ParseBody('00000000001', '', body21, cues21, fields, 0)
		expect(result).toEqual(
			literal<PartDefinition[]>([
				literal<PartDefinitionKam>({
					externalId: '00000000001-0',
					type: PartType.Kam,
					variant: {
						name: '2'
					},
					rawType: 'KAM 2',
					cues: [],
					script: 'Hallo, I wnat to tell you......\nHEREEEELLLLOOOK\nYES\n',
					fields,
					modified: 0
				}),
				literal<PartDefinitionServer>({
					externalId: '00000000001-1',
					type: PartType.Server,
					variant: {},
					rawType: 'SERVER',
					cues: literal<CueDefinition[]>([
						literal<CueDefinitionGrafik>({
							type: CueType.Grafik,
							template: 'ident_blank',
							textFields: ['ODENSE', 'KLJ']
						}),
						literal<CueDefinitionGrafik>({
							type: CueType.Grafik,
							template: 'bund',
							textFields: ['ANETTE RYTTER', 'Inews']
						}),
						literal<CueDefinitionGrafik>({
							type: CueType.Grafik,
							template: 'bund',
							textFields: ['ANETTE RYTTER', 'anry@tv2.dk']
						}),
						literal<CueDefinitionUnknown>({
							type: CueType.Unknown,
							start: {
								seconds: 1
							}
						})
					]),
					script: '',
					fields,
					modified: 0
				}),
				literal<PartDefinitionKam>({
					externalId: '00000000001-2',
					type: PartType.Kam,
					variant: {
						name: '1'
					},
					rawType: 'KAM 1',
					cues: [],
					script: '',
					fields,
					modified: 0
				}),
				literal<PartDefinitionKam>({
					externalId: '00000000001-3',
					type: PartType.Kam,
					variant: {
						name: '1'
					},
					rawType: 'KAM 1',
					cues: [],
					script: '',
					fields,
					modified: 0
				}),
				literal<PartDefinitionSlutord>({
					externalId: '00000000001-4',
					type: PartType.Slutord,
					variant: {
						endWords: ''
					},
					rawType: 'SLUTORD:',
					cues: [],
					script: '',
					fields,
					modified: 0
				}),
				literal<PartDefinitionKam>({
					externalId: '00000000001-5',
					type: PartType.Kam,
					variant: {
						name: '1'
					},
					rawType: 'KAM 1',
					cues: [],
					script: '',
					fields,
					modified: 0
				})
			])
		)
	})
})
