# Camera setup

To set up cameras, add the `Camera Mapping` studio blueprint configuration.

You will then need to add Sisyfos sources for each camera:

```JSON
Layer ID: sisyfos_camera_active_1
Device Type: SISYFOS
Device ID: sisyfos0
Lookahead Mode: PRELOAD,
Sisyfos Channel: 1
```

```JSON
Layer ID: sisyfos_camera_active_AR
Device Type: SISYFOS
Device ID: sisyfos0
Lookahead Mode: PRELOAD,
Sisyfos Channel: 2
```

Camera names must match exactly (case sensitive), however, if your camera name contains spaces, e.g. `CS 1`, it will need to be written as `CS_1`.
