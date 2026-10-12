# Sleuth DORA metrics for Backstage

This repository holds a Backstage plugin that shows [Sleuth](https://sleuth.io) delivery metrics inside
Backstage, together with a small Backstage app for trying it out.

## What is here

| Folder                             | What it is                                                                                |
| ---------------------------------- | ----------------------------------------------------------------------------------------- |
| `plugins/sleuth-dora`              | The screens, published as `@backstagerunway/plugin-sleuth-dora`                           |
| `plugins/sleuth-dora-backend`      | The part that talks to Sleuth, published as `@backstagerunway/plugin-sleuth-dora-backend` |
| `packages/app`, `packages/backend` | A Backstage app that runs both, for development and for the browser tests                 |
| `examples`                         | Sample catalog entries the app loads                                                      |

## Where to read next

- [What the plugin does and how to install it](plugins/sleuth-dora/README.md)
- [Reading the dashboards](plugins/sleuth-dora/docs/reading-the-dashboards.md): what every number, arrow
  and badge means, for people who use the screens
- [Every setting](plugins/sleuth-dora/CONFIGURATION.md)
- [The backend](plugins/sleuth-dora-backend/README.md)

## Running it locally

```bash
yarn install
SLEUTH_API_KEY=<your key> yarn start
```

The app opens on http://localhost:3000 and the backend runs on http://localhost:7007. The organisation,
environment and default project it uses are set under `dora.sleuth` in `app-config.yaml`.

## Checking your changes

```bash
yarn tsc         # types
yarn lint:all    # style
yarn test        # unit and screen tests
yarn test:e2e    # the three screens in a real browser; needs no API key
```
