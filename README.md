# Reference Spreadsheet Blueprints

This is a reference blueprints package for the [Sofie News Studio Automation System](https://github.com/nrkno/Sofie-TV-automation/).

## How to Use the TV2 Blueprints

These blueprints are meant for use at TV 2 Denmark and are written for that purpose. How ever they arew free to be used as a base for building new Blueprints.

They are based on:
* iNews
* Atem Constellation VMX
* CasparCG playout
* VizRt graphics
* Sisyfos Audio controller

## Getting started

To start using these blueprints in Sofie, start with going through the [Getting Started guide](https://sofie.gitbook.io/sofie-tv-automation/documentation/getting-started) in the Sofie documentation.



## Installation (for developers)

For developers installation steps are as following:
```sh
git clone https://github.com/olzzon/tv2-sofie-blueprints-inews.git
yarn
yarn dist
```
The result dist/*-bundle.js files can be distributed and uploaded in the Sofie UI

TODO - bundle.json is a valid distribution format

## Development

This project builds with webpack and can auto upload on successful compilation
```sh
yarn watch-sync-local # alias to upload to a local instance
yarn watch --env.server="http://localhost:3000" # can be used to connect to upload to a remote sofie instance
```

There are some unit tests for the project, currently just to validate that the blueprints do not crash while executing.
These can be run with 
```sh
yarn unit # run once
yarn test # watch for changes
```
