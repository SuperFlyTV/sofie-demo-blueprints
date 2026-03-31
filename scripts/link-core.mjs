#!/usr/bin/env zx

import { argv, path, usePowerShell } from 'zx'

if (process.platform === 'win32') {
	usePowerShell()
}

const corePath = argv._[0]
if (!corePath) {
	console.error('Usage: yarn link-core <path-to-core>')
	process.exit(1)
}

const corePath2 = path.resolve(corePath)
console.log(`Linking core from ${corePath2}...`)

await $`yarn link ${corePath2}/packages/shared-lib ${corePath2}/packages/blueprints-integration`

await $`yarn install`
