# Sofie: The Modern TV News Studio Automation System

This is **not** the NRK specific blueprints for the [Sofie News Studio Automation System](https://github.com/nrkno/Sofie-TV-automation/).

## Installation

For developers installation steps are as following:

```sh
git clone https://github.com/nrkno/tv-automation-sofie-blueprints
yarn
yarn dist
```

One of the `dist/*-bundle.js` can be uploaded in the Sofie UI. Or one of the `dist/bundle*.json` can be uploaded to upload a group of blueprints.

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
