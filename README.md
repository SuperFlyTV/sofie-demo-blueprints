# Sofie: The Modern TV News Studio Automation System

This is **not** the NRK-specific blueprints for the [Sofie News Studio Automation System](https://github.com/nrkno/Sofie-TV-automation/).

These blueprints work with the [Rundown Editor](https://github.com/SuperFlyTV/sofie-automation-rundown-editor) or the [Spreadsheet Gateway](https://github.com/SuperFlyTV/spreadsheet-gateway).

## Prerequisites

- One of the following supported vision mixers:
  - [Blackmagic ATEM](https://www.blackmagicdesign.com/products/atem)
  - [vMix](https://www.vmix.com/)
- [A CasparCG setup](https://nrkno.github.io/tv-automation-server-core/docs/getting-started/installation/installing-connections-and-additional-hardware/casparcg-server-installation) with the [Sofie Demo Assets](https://superfly.tv/sofie/demo/assets/sofie-demo-assets_v1.0.1.zip) installed.

  - This demo expects two channels to be configured in CasparCG: the first is used for media/VT playout and the second is used for graphics playout. Open `casparcg.config` in your text editor of choice and scroll down for more information on how to configure CasparCG. Your `<paths>` section should look like this:

  ```
  <paths>
  	<media-path>sofie-demo-media/</media-path>
  	<log-path>log/</log-path>
  	<data-path>data/</data-path>
  	<template-path>sofie-demo-template/</template-path>
  	<thumbnail-path>thumbnail/</thumbnail-path>
  	<font-path>font/</font-path>
  </paths>
  ```

- A [Sisyfos Audio Controller](https://github.com/tv2/sisyfos-audio-controller) setup
- A [Sofie Core](https://github.com/nrkno/tv-automation-server-core) release 37 setup.

> 💡 If you don't have a supported vision mixer, CasparCG setup, or Sisyfos setup, that's okay. You can still proceed with the demo setup and skip the steps for the pieces you don't have.

## Installation

1. In the Sofie UI, ensure that all migrations have been run.
   - Navigate to `http://[YOUR SOFIE CORE IP]:3000/settings/tools/migration?admin=1`.
     - If you're on the machine where Sofie Core is running, this will be http://localhost:3000/settings/tools/migration?admin=1
   - Fill out all the fields and then click "Run automatic migration procedure".
   - If you don't wish to demo the Slack integration, enter `http://localhost:3000` for the Slack webhook URL.
   - For this demo, we'll be using a media format of `1280x720p5000`.
1. Ensure that [`playout-gateway`](https://github.com/nrkno/tv-automation-server-core/tree/master/packages/playout-gateway) is running and attached to the studio.
   - Under the Studios heading, select your studio.
   - Scroll down to the Attached Devices section.
   - Click the plus icon (`+`) and attach the Playout gateway.
   - You'll be coming back to this section later to attach your vision mixer, CasparCG, and Sisyfos devices.
1. Head to the [releases](https://github.com/SuperFlyTV/sofie-demo-blueprints/releases) page and download the `demo-blueprints-r*.zip` file for the latest release.
1. Extract the zip archive and upload each of blueprints via the Sofie UI:
   - Back on the Sofie settings page, click the plus icon (`+`) to the right of the Blueprints heading.
   - Select the new blueprint and then click "Upload Blueprints".
   - Select `system-bundle.js` from the extracted zip archive.
   - Name this blueprint `system`.
   - Click the plus icon again to add another blueprint.
   - This time, upload `studio0-bundle.js`, naming it `studio0`.
   - Repeat for `showstyle0-bundle.js`, naming it `showstyle0`.
1. Assign the blueprints:
   - Select the `system` blueprint and click the "Assign" button.
   - Under the Studios heading, select your studio.
   - In the Blueprint dropdown, select `studio0`.
   - Under the Show Styles heading, select your showstyle.
   - In the Blueprint dropdown, select `showstyle0`.
1. Run the blueprint migrations
   - Under the Tools heading, click "Upgrade Database".
   - Fill out any fields and run the migrations.
     - If there's a device you don't have, enter `127.0.0.1` for the IP address.
1. Add your vision mixer device to the Playout Gateway
   - Under the Devices heading, select Playout Gateway
   - In the Sub Devices section, click the plus button (`+`) to add a new device.
   - Click the edit button (pencil icon) to the right of the newly added device.
   - If using an ATEM, give it a Device ID of `atem0`. If using vMix, give it a Device ID of `vmix0`.
   - Select the appropriate Device Type from the dropdown.
   - Fill out the Host and Port fields.
     - For an ATEM, the port will be `9910`.
     - For vMix, the port can be obtained from "Settings > Web Contoller". It defaults to `8088`.
1. Go back to the Studio settings (http://localhost:3000/settings/studio/studio0) and scroll down to the Blueprint Configuration section.
   - Create and fill out the configuration for the devices you have.
     - If using an ATEM for your vision mixer, ensure that you have the following inputs configured: 2 `camera`, 1 `remote`, 1 `mediaplayer`, and 1 `graphics`.
     - If using vMix, ensure that you have all of the above and 1 `multiview` input configured. This input will be used for DVEs.
   - After filling out this configuration, you may need to run migrations again. On the "[Upgrade Database](http://localhost:3000/settings/tools/migration)" page, click "Reset All Versions" then click "Run automatic migration procedure".
   - Click "Reload Baseline" (just above the "Attached Devices" section in the Studio settings).
1. Restart the Playout Gateway.
1. Use the [Rundown Editor](https://github.com/SuperFlyTV/sofie-automation-rundown-editor) or the [Spreadsheet Gateway](https://github.com/SuperFlyTV/spreadsheet-gateway) to add a demo rundown to Sofie.
1. Go to the Rundowns page (http://localhost:3000/rundowns) and click on the rundown you added in the previous step.
   - > 💡 Certain changes to your Sofie configuration may require that the rundown be re-ingested for those changes to take effect. If using the Rundown Editor, this can be achieved by selecting the rundown in question, unchecking the "Sync to Sofie" box, hitting save, rechecking that box, then hitting save again.
1. (Optional) If you wish to have accurate media/VT statuses in the Rundown view, as well as hoverscrub media previews, set up [Package Manager](https://nrkno.github.io/tv-automation-server-core/docs/getting-started/installation/installing-package-manager).
1. Right-click the blue header bar and click Activate (Rehearsal).
1. Hit F12 to Take.

## Installation (for developers)

For developers, the installation steps are as follows:

```sh
git clone https://github.com/SuperFlyTV/sofie-demo-blueprints.git
yarn
yarn dist
```

The `dist/*-bundle.js` files can then be uploaded, assigned, and configured in the Sofie UI.

## Development

This project builds with webpack and can auto upload on successful compilation

```sh
yarn watch-sync-local # alias to upload to a local instance
# yarn watch --env.server="http://localhost:3000" # can be used to connect to upload to a remote sofie instance
```

The `--env.bundle=distriktsnyheter` can be used for watch or build to only build a specific bundle. Warning: using this parameter with the `yarn dist` will cause mismatched versions in the outputs.

There are some unit tests for the project, currently just to validate that the blueprints do not crash while executing.
These can be run with

```sh
yarn unit # run once
yarn test # watch for changes
```

When adding code that uses new fields on the MosExternalMetadata, make sure to add a new rundown to the tests, to ensure that code is covered by the few tests that have been added.
