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
	console.log('Playlist externalId:', playlistExternalId)
	const order = [...rundowns].reduce<BlueprintResultOrderedRundowns>((prev, curr, i) => {
		return {
			...prev,
			[curr.externalId]: i,
		}
	}, {})

	return {
		playlist: {
			name: 'READY TO AIR',
			timing: { type: PlaylistTimingType.None },
		},
		order,
	}
}
