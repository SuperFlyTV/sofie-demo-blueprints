# AGENTS.md

## Cursor Cloud specific instructions

This repository is a **Yarn 4 monorepo** for Sofie TV studio automation demo blueprints. It does not include Sofie Core or playout hardware — those are external dependencies for full end-to-end TV automation.

### Packages

| Package | Path | Purpose |
|---------|------|---------|
| `blueprints` | `packages/blueprints` | Builds `*-bundle.js` files for upload into Sofie Core |
| `docs` | `packages/docs` | Docusaurus documentation site |

### Prerequisites

- **Node.js 22+** (see `.node-version`)
- **Yarn 4.12.0** via Corepack (`packageManager` in root `package.json`)

### Common commands (from repo root)

| Task | Command |
|------|---------|
| Install deps | `corepack enable && yarn` |
| Lint blueprints | `cd packages/blueprints && yarn lint` |
| Lint docs | `cd packages/docs && yarn lint` |
| Test | `yarn test:blueprints` |
| Build blueprints | `cd packages/blueprints && yarn dist` |
| Build docs | `yarn build:docs` |
| Docs dev server | `yarn watch:docs` (port **3030**, base path `/sofie-demo-blueprints/`) |

CI mirrors these steps in `.github/workflows/node.yaml`.

### Gotchas

- **Docs base path**: Docusaurus is configured with `baseUrl: /sofie-demo-blueprints/`. The dev server homepage is at `http://localhost:3030/sofie-demo-blueprints/`, not `http://localhost:3030/`.
- **Blueprint upload to Sofie**: `yarn watch-sync-local` and `yarn build-sync-local` POST bundles to `http://127.0.0.1:3000`. Sofie Core must be running separately for those commands to succeed.
- **`yarn dist` runs tests first**: The blueprints `dist` script runs `yarn test` before building bundles.
- **Peer dependency warnings** on `yarn install` (TypeScript version, docs eslint) are expected and do not block builds.

### External services (not in this repo)

Full TV automation demo requires Sofie Core r53, playout-gateway, and a rundown ingest tool (Rundown Editor or Spreadsheet Gateway). See `README.md` for the complete setup guide.
