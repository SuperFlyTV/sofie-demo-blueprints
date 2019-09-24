import { BodyCodes } from '../inewsConversion/converters/BodyCodesToJS'

describe('RundownManager', () => {
	const ingestRundown = require('../../../rundowns/example.json')
	const bodyCodes = require('../../__mocks__/bodyCodes.json')

	it('Extract Body Codes', () => {
		expect(BodyCodes.extract(ingestRundown.segments[0].payload.iNewsStory.body)).toEqual(bodyCodes)
	})
})
