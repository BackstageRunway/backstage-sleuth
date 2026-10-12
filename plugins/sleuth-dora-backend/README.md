# Sleuth DORA metrics for Backstage: backend

This is the half of the Sleuth DORA plugin that talks to [Sleuth](https://sleuth.io). The screens in
`@backstagerunway/plugin-sleuth-dora` ask this backend for their numbers; it asks Sleuth, using an API
key that never leaves the server.

You need both packages. Start with the
[main plugin documentation](https://www.npmjs.com/package/@backstagerunway/plugin-sleuth-dora), which
covers the whole setup. This page is the reference for the backend alone.

## Install

```bash
yarn --cwd packages/backend add @backstagerunway/plugin-sleuth-dora-backend
```

```typescript
// packages/backend/src/index.ts
backend.add(import('@backstagerunway/plugin-sleuth-dora-backend'));
```

## Configure

```yaml
# app-config.yaml
dora:
  sleuth:
    organizationId: my-org # required: your Sleuth organisation slug
    apiKey: ${SLEUTH_API_KEY} # required: your Sleuth API key
    cacheTtlSeconds: 300 # optional: how long answers from Sleuth are reused
    # apiUrl: https://app.sleuth.io
```

If the key or the organisation is missing, Backstage still starts. This plugin logs a warning and
answers every request with "Sleuth DORA plugin is not configured", naming what is missing.

## What it does with a request

- **Works out the dates.** A request names a period such as `last28days`. The backend turns that into
  the period ending at the close of today (UTC) and the equally long period before it, so the screens
  can show a change.
- **Asks Sleuth** for the figures of both periods.
- **Remembers the answer** for five minutes, or for `cacheTtlSeconds`, so that many people opening the
  same screen do not each cause a call to Sleuth.
- **Passes Sleuth's figures on unchanged.** Nothing is recalculated here.

## Requests it answers

All addresses start with `/api/sleuth-dora-backend` and need a signed-in Backstage user. `timeRange` is
`last` + a number of days + `days`, for example `last7days`.

| Request                                                                    | Returns                                                                                                                                                         |
| -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /metrics/:projectSlug?environment=&deploymentId=&timeRange=`          | The four metrics for a project, for the current and the previous period. `deploymentId` narrows it to one code deployment; leave it empty for the whole project |
| `GET /metrics-insights/:projectSlug?environment=&deploymentId=&timeRange=` | Sleuth's own observations for the same scope                                                                                                                    |
| `GET /org-trend-metrics?timeRange=`                                        | The four metrics for the whole organisation: the total, the total of the previous period, and the period cut into four parts                                    |
| `POST /batch-team-metrics` with `{ teamSlugs, environment, timeRange }`    | The four metrics for each team, for the current and the previous period. A team Sleuth does not know is left out                                                |

## When a request fails

| Status | Meaning                                                                                                                                                                |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 400    | The request is missing something or the time range is not in the expected form                                                                                         |
| 404    | Sleuth has no data for what was asked, or has no code deployment by that name. The message says which                                                                  |
| 502    | Sleuth refused the request or could not be reached. The message includes Sleuth's own reason, such as a project or environment it does not know, or a rejected API key |
| 503    | The plugin is not configured                                                                                                                                           |
| 500    | Something unexpected went wrong in the backend. The details are in the backend log, not in the answer                                                                  |
