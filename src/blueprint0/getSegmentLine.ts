import * as _ from 'underscore'
import {
	SegmentLineContext,
	StoryResult,
	MOS
} from 'tv-automation-sofie-blueprints-integration'

export default function (context: SegmentLineContext, story: MOS.IMOSROFullStory): StoryResult | null {
	let type = ''
	let variant = ''

	if (story.MosExternalMetaData) {
		for (let md of story.MosExternalMetaData) {
			if (
				md.MosScope === 'PLAYLIST' &&
				md.MosSchema.match(/10505\/schema\/enps.dtd/)
			) {
				type = md.MosPayload.mosartType + ''
				variant = md.MosPayload.mosartVariant + ''

				if (!type) {
					context.warning(`Type missing in Story ${story.Slug} `)
					return null
				} else if (!variant) {
					context.warning(`Variant missing in Story ${story.Slug} `)
					return null
				} else if (type.match(/kam/i)) {
					// return KamBlueprint(context, story)
				}
			}
		}
	}

	context.warning(`No template found for Type: "${type}", Variant: "${variant}" in Story ${story.Slug}`)
	return null
}
