# AB Playback

To setup AB playback, first go to the blueprint settings in the studio settings and add the media player type option, set it to CasparAB.

Then add the media player inputs setting and add the following:

`1:17,2:18`

This means player 1 (A) is on ATEM input 17, player 2 (B) is on ATEM input 18.

Then add the following layer mappings:

```JSON
Layer ID: casparcg_player_clip_1
Device Type: CASPARCG
Device ID: caspar01
Lookahead Mode: NONE
CasparCG Channel: 1
CasparCG Layer: 100
```

```JSON
Layer ID: casparcg_player_clip_2
Device Type: CASPARCG
Device ID: caspar01
Lookahead Mode: NONE
CasparCG Channel: 2
CasparCG Layer: 100
```

Where channel 1 is A and channel 2 is B

```JSON
Layer ID: casparcg_player_clip_pending
Device Type: ABSTRACT
Device ID: abstract0
Lookahead Mode: PRELOAD
```

```JSON
Layer ID: sisyfos_source_clip_pending
Device Type: ABSTRACT
Device ID: abstract0
Lookahead Mode: NONE
```

```JSON
Layer ID: sisyfos_player_clip_1
Device Type: SISYFOS
Device ID: sisyfos0
Lookahead Mode: NONE
Sisyfos Channel: 0
```

```JSON
Layer ID: sisyfos_player_clip_2
Device Type: SISYFOS
Device ID: sisyfos0
Lookahead Mode: NONE
Sisyfos Channel: 1
```

Where channels 1 and 2 are the audio channels for server A and B respectively.
