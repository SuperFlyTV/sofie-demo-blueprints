import { literal } from '../../../../common/util'
import { CueDefinition, CueType, ParseCue } from '../ParseCue'

describe('Cue parser', () => {
	test('Null Cue', () => {
		const result = ParseCue(null)
		expect(result).toEqual(
			literal<CueDefinition>({
				type: CueType.Unknown
			})
		)
	})

	test('Grafik (kg) - Inline first text field', () => {
		const cueGrafik = ['kg bund HELENE RØNBJERG KRISTENSEN', 'herk@tv2.dk', ';0.02']
		const result = ParseCue(cueGrafik)
		expect(result).toEqual(
			literal<CueDefinition>({
				type: CueType.Grafik,
				template: 'bund',
				textFields: ['HELENE RØNBJERG KRISTENSEN', 'herk@tv2.dk'],
				start: {
					seconds: 2
				}
			})
		)
	})

	test('Grafik (kg) - Multiline text fields', () => {
		const cueGrafik = ['kg bund', 'HELENE RØNBJERG KRISTENSEN', 'herk@tv2.dk', ';0.02']
		const result = ParseCue(cueGrafik)
		expect(result).toEqual(
			literal<CueDefinition>({
				type: CueType.Grafik,
				template: 'bund',
				textFields: ['HELENE RØNBJERG KRISTENSEN', 'herk@tv2.dk'],
				start: {
					seconds: 2
				}
			})
		)
	})

	test('Grafik (kg) - No time', () => {
		const cueGrafik = ['kg bund', 'HELENE RØNBJERG KRISTENSEN', 'herk@tv2.dk']
		const result = ParseCue(cueGrafik)
		expect(result).toEqual(
			literal<CueDefinition>({
				type: CueType.Grafik,
				template: 'bund',
				textFields: ['HELENE RØNBJERG KRISTENSEN', 'herk@tv2.dk']
			})
		)
	})

	test('Grafik (kg) - All out', () => {
		const cueGrafik = ['kg ovl-all-out', 'CLEAR OVERLAY', ';0.00']
		const result = ParseCue(cueGrafik)
		expect(result).toEqual(
			literal<CueDefinition>({
				type: CueType.Ignored_MOS,
				command: ['kg ovl-all-out', 'CLEAR OVERLAY', ';0.00']
			})
		)
	})

	test('Grafik (kg) - Start and end time', () => {
		const cueGrafik = ['kg bund STIG NIKOLAJ BLOMBERG', 'Forsker, Akutberedskabet, Region Hovedstaden', ';0.27-0.31']
		const result = ParseCue(cueGrafik)
		expect(result).toEqual(
			literal<CueDefinition>({
				type: CueType.Grafik,
				start: {
					seconds: 27
				},
				end: {
					seconds: 31
				},
				template: 'bund',
				textFields: ['STIG NIKOLAJ BLOMBERG', 'Forsker, Akutberedskabet, Region Hovedstaden']
			})
		)
	})

	test('KG=DESIGN_FODBOLD', () => {
		const cueGrafik = ['KG=DESIGN_FODBOLD', ';0.00.01']
		const result = ParseCue(cueGrafik)
		// expect(result).toEqual(literal<CueDefinition>({}))
		// TODO: This test
		expect(result).toBeTruthy()
	})

	test('MOS object', () => {
		const cueMOS = [
			']] S3.0 M 0 [[',
			'cg4 ]] 2 YNYAB 0 [[ pilotdata',
			'TELEFON/KORT//LIVE_KABUL',
			'VCPID=2552305',
			'ContinueCount=3',
			'TELEFON/KORT//LIVE_KABUL'
		]
		const result = ParseCue(cueMOS)
		expect(result).toEqual(
			literal<CueDefinition>({
				type: CueType.MOS,
				name: 'TELEFON/KORT//LIVE_KABUL',
				vcpid: 2552305,
				continueCount: 3
			})
		)
	})

	test('EKSTERN', () => {
		const cueEkstern = ['EKSTERN=LIVE 1']
		const result = ParseCue(cueEkstern)
		expect(result).toEqual(
			literal<CueDefinition>({
				type: CueType.Ekstern,
				source: 'LIVE 1'
			})
		)
	})

	test('DVE', () => {
		const cueDVE = ['DVE=sommerfugl', 'INP1=KAM 1', 'INP2=LIVE 1', 'BYNAVN=Odense/København']
		const result = ParseCue(cueDVE)
		expect(result).toEqual(
			literal<CueDefinition>({
				type: CueType.DVE,
				template: 'sommerfugl',
				sources: ['KAM 1', 'LIVE 1'],
				labels: ['Odense', 'København']
			})
		)
	})

	test('TELEFON with Grafik', () => {
		const cueTelefon = ['TELEFON=TLF 2', 'kg bund', 'HELENE RØNBJERG KRISTENSEN', 'herk@tv2.dk', ';0.02']
		const result = ParseCue(cueTelefon)
		expect(result).toEqual(
			literal<CueDefinition>({
				type: CueType.Telefon,
				source: 'TLF 2',
				vizObj: {
					type: CueType.Grafik,
					start: {
						seconds: 2
					},
					template: 'bund',
					textFields: ['HELENE RØNBJERG KRISTENSEN', 'herk@tv2.dk']
				}
			})
		)
	})
})
