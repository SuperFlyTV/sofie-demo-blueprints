import {
	BlueprintResultOrderedRundowns,
	BlueprintResultRundownPlaylist,
	IBlueprintRundown,
	IStudioUserContext,
	PlaylistTimingType,
} from '@sofie-automation/blueprints-integration'

export function getRundownPlaylistInfo(
	_context: Readonly<IStudioUserContext>,
	rundowns: readonly Readonly<IBlueprintRundown>[],
	playlistExternalId: string
): BlueprintResultRundownPlaylist | null {
	if (rundowns.length === 0) {
		return null
	}
	const readyOnAirRundowns = rundowns.filter((r) => r.playlistExternalId === playlistExternalId)

	const order = [...readyOnAirRundowns].reduce<BlueprintResultOrderedRundowns>((prev, curr, i) => {
		return {
			...prev,
			[curr.externalId]: i,
		}
	}, {})

	return {
		playlist: {
			name: 'READY TO AIR',
			timing: { type: PlaylistTimingType.ForwardTime, expectedStart: 0, expectedDuration: 0 },
		},
		order,
	}
}
