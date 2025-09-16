---
sidebar_position: 1
---

# Intro

[Blueprints](https://nrkno.github.io/sofie-core/docs/user-guide/concepts-and-architecture#blueprints) are programs that run inside Sofie Core and interpret
data coming in from the Rundowns and transform that into playable elements. They use an API published in [@sofie-automation/blueprints-integration](https://nrkno.github.io/sofie-core/typedoc/modules/_sofie_automation_blueprints_integration.html) library to expose their functionality and communicate with Sofie Core.

Technically, a Blueprint is a JavaScript object, implementing one of the `BlueprintManifestBase` interfaces.

Currently, there are three types of Blueprints:

- [Show Style Blueprints](https://nrkno.github.io/sofie-core/typedoc/interfaces/_sofie_automation_blueprints_integration.ShowStyleBlueprintManifest.html) - handling converting NRCS Rundown data into Sofie Rundowns and content.
- [Studio Blueprints](https://nrkno.github.io/sofie-core/typedoc/interfaces/_sofie_automation_blueprints_integration.StudioBlueprintManifest.html) - handling selecting ShowStyles for a given NRCS Rundown and assigning NRCS Rundowns to Sofie Playlists
- [System Blueprints](https://nrkno.github.io/sofie-core/typedoc/interfaces/_sofie_automation_blueprints_integration.SystemBlueprintManifest.html) - handling system provisioning and global configuration

## Installation and Configuration

See the [README](https://github.com/SuperFlyTV/sofie-demo-blueprints#readme) for step-by-step instructions.

## Terminology

### Rundown

A list of Segments that define a full show from start to finish.

### Segment

A list of Parts laid out on a timeline that define a specific portion of the show from start to finish. It is possible to "adlib" and deviate from this list by modifying or skipping Parts on-the-fly. Segments can also be skipped.

### Part

A Part is a group of Pieces that together form a complete scene. Pieces in Parts don't all have to start and end at the same time. Parts can be skipped or adlibbed.

### Piece

A Piece is the smallest building block of a Sofie rundown. It defines a specific aspect of what should be happening in the show at that exact moment, such as which camera to show, which microphones to unmute, and which graphics to play. Pieces can have a fixed duration or they can be "infinite", in which case they will only end when the operator performs a Take to move to the next Part.
