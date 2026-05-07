import { ICommonContext, IConfigMessage, NoteSeverity } from '@sofie-automation/blueprints-integration'
import { StudioConfig } from './helpers/config.js'
import { t } from '../../common/util.js'
import { SourceType, VisionMixerDevice } from './helpers/config.js'

export function validateConfig(_context: ICommonContext, config: StudioConfig): Array<IConfigMessage> {
	const messages: IConfigMessage[] = []

	if (config.atemSources) {
		messages.push({
			level: NoteSeverity.INFO,
			message: t('Here in validateConfig you can add check for e.g. Atem/VMix'),
		})
	}

	if (config.visionMixer.type === VisionMixerDevice.OBS) {
		for (const sourceId of config.obsAbMediaPlayerSourceIds ?? []) {
			const source = config.obsSources[sourceId]
			if (!source) {
				messages.push({
					level: NoteSeverity.WARNING,
					message: t(`OBS AB media player source '${sourceId}' does not exist in obsSources`),
				})
			} else if (source.type !== SourceType.MediaPlayer) {
				messages.push({
					level: NoteSeverity.WARNING,
					message: t(`OBS AB media player source '${sourceId}' must have type 'mediaplayer'`),
				})
			}
		}

		if (config.obsEffectsMediaPlayerSourceId) {
			const effectsSource = config.obsSources[config.obsEffectsMediaPlayerSourceId]
			if (!effectsSource) {
				messages.push({
					level: NoteSeverity.WARNING,
					message: t(
						`OBS effects media player source '${config.obsEffectsMediaPlayerSourceId}' does not exist in obsSources`
					),
				})
			} else if (effectsSource.type !== SourceType.MediaPlayer) {
				messages.push({
					level: NoteSeverity.WARNING,
					message: t(
						`OBS effects media player source '${config.obsEffectsMediaPlayerSourceId}' must have type 'mediaplayer'`
					),
				})
			}
		}
	}
	return messages
}
