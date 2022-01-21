/**
 * This file can be used to add additional types to some of the
 * interfaces that may change between blueprints such as
 * metadata etc.
 */

import {
	IBlueprintActionManifestDisplay,
	IBlueprintActionManifestDisplayContent,
	OnGenerateTimelineObj,
	TimelineObjectCoreExt,
} from '@sofie-automation/blueprints-integration'
import { SetRequired } from 'type-fest'

export interface PartEndStateExt {}

export interface TimelinePersistentStateExt {}

export interface TimelineObjectMetaData {}

export interface TimelineObjectKeyframeMetaData {}

export type TimelineBlueprintExt = TimelineObjectCoreExt<TimelineObjectMetaData, TimelineObjectKeyframeMetaData>
export type OnTimelineGenerateBlueprintExt = TimelineBlueprintExt &
	OnGenerateTimelineObj<TimelineObjectMetaData, TimelineObjectKeyframeMetaData>

export interface PieceMetaDataExt {}

export type AdLibActionDisplayContentExt = SetRequired<IBlueprintActionManifestDisplayContent, 'tags'>
export type AdLibActionDisplayExt = IBlueprintActionManifestDisplay
