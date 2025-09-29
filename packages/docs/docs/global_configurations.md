---
sidebar_position: 5
---

# Global Configurations

The Demo Blueprints come with a set of globally-configurable parameters, some of which are required.

## Studio Configuration

These are the config parameters for the Studio. They can be accessed from the [Studio Blueprint Configuration page](http://localhost:3000/settings/studio/studio0/blueprint-config).

### Vision Mixer Type

This is where you can choose between using a Blackmagic ATEM or vMix.

### ATEM Sources

This is how the blueprints know which ATEM inputs correspond to cameras, remotes, graphics, etc. Configuring these is required. See the [README](https://github.com/SuperFlyTV/sofie-demo-blueprints#readme) for more information.

### ATEM Outputs

This is where you can configure fixed aux outputs for your ATEM, such as always outputting Camera 1 to Aux 1, Remote 1 to Aux 2, etc.

### vMix Sources

This is how the blueprints know which vMix inputs correspond to cameras, remotes, graphics, etc. Configuring these is required. See the [README](https://github.com/SuperFlyTV/sofie-demo-blueprints#readme) for more information.

### Sisyfos Sources

This is how the blueprints know which audio channels correspond to the host, guests, remotes, and VTs. Used by the blueprints to automatically mute/unmute these channels as-needed.

### Preview Renderer

For internal use at NRK only.

### CasparCG Latency

This is how the blueprints know how much to preroll certain pieces by to account for Caspar's inherent SDI latency. The delay should be provided in milliseconds, not frames.

## Showstyle Configuration

These are the config parameters for the Showstyle. They can be accessed from the [Showstyle Blueprint Configuration page](http://localhost:3000/settings/showStyleBase/show0/blueprint-config).

### DVE Presets

This is where the DVE configuration for Split Pieces is defined. Default values are provided for a "two split" setup. These parameters only apply to ATEM vision mixers.
