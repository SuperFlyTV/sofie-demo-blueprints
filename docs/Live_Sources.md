# Live Sources (EKSTERN)

To use remote sources, first add the `RM Mapping` studio blueprint configuration.

You will then need to add the following Sisyfos layer mappings for each remote source:

```JSON
Layer ID: sisyfos_remote_source_1 // Mono / default variant
Device Type: SISYFOS
Device ID: sisyfos0
Lookahead Mode: PRELOAD,
Sisyfos Channel: 1
```

```JSON
Layer ID: sisyfos_remote_source_1_spor_2 // Spor 2 variant
Device Type: SISYFOS
Device ID: sisyfos0
Lookahead Mode: PRELOAD,
Sisyfos Channel: 2
```

```JSON
Layer ID: sisyfos_remote_source_1_stereo_1 // Stereo channel 1
Device Type: SISYFOS
Device ID: sisyfos0
Lookahead Mode: PRELOAD,
Sisyfos Channel: 1
```

```JSON
Layer ID: sisyfos_remote_source_1_stereo_2 // Stereo channel 2
Device Type: SISYFOS
Device ID: sisyfos0
Lookahead Mode: PRELOAD,
Sisyfos Channel: 2
```
