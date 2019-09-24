const fs = require('fs')
const ingestRundown = JSON.parse(fs.readFileSync('rundowns/example.json'))
const bodyCodes = JSON.parse(fs.readFileSync('src/__mocks__/bodyCodes.json'))
import { BodyCodes } from '../inewsConversion/converters/BodyCodesToJS'

describe('RundownManager', () => {
	it('Extract Body Codes', () => {
		expect(BodyCodes.extract(ingestRundown.segments[0].payload.iNewsStory.body)).toEqual(bodyCodes)
	})
})
