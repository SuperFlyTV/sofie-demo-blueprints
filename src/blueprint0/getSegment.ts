import * as _ from 'underscore'
import {
	SegmentContext, IngestSegment, BlueprintResultSegment, IBlueprintSegment, BlueprintResultPart
} from 'tv-automation-sofie-blueprints-integration'
import { literal } from '../common/util'
import { SegmentConf } from '../types/classes'
import { parseConfig } from './helpers/config'
import { parseSources } from './helpers/sources'

export function getSegment (context: SegmentContext, ingestSegment: IngestSegment): BlueprintResultSegment {
	const config: SegmentConf = {
		context: context,
		config: parseConfig(context),
		sourceConfig: parseSources(context, parseConfig(context)),
		frameHeight: 1920,
		frameWidth: 1080,
		framesPerSecond: 50
	}
	const segment = literal<IBlueprintSegment>({
		name: ingestSegment.name,
		metaData: {}
	})
	const parts: BlueprintResultPart[] = []
	console.log(config)

	if (ingestSegment.payload['float']) {
		return {
			segment,
			parts
		}
	}

	return {
		segment,
		parts
	}
}
