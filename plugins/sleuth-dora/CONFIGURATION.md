# Configuration

Everything the plugin can be told, in one place. Settings go in your Backstage `app-config.yaml`;
per-component settings go in that component's `catalog-info.yaml`.

## App settings

```yaml
dora:
  sleuth:
    organizationId: my-org
    apiKey: ${SLEUTH_API_KEY}
    environment: production
    defaultProjectSlug: my-project
    defaultTimeRange: last28days
    cacheTtlSeconds: 300
    # apiUrl: https://app.sleuth.io
```

| Setting              | Required | Default                 | What it does                                                                                                                                 |
| -------------------- | -------- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `organizationId`     | Yes      |                         | The short name (slug) of your Sleuth organisation: the part after `app.sleuth.io/` in the address bar                                        |
| `apiKey`             | Yes      |                         | Your Sleuth API key. It stays in the backend and is never sent to the browser                                                                |
| `environment`        | No       | `production`            | The Sleuth environment the screens report on                                                                                                 |
| `defaultProjectSlug` | No       | `sleuth`                | The Sleuth project used for a component that does not name one                                                                               |
| `defaultTimeRange`   | No       | `last28days`            | The period the team screen opens with: `last7days`, `last14days`, `last28days` or `last90days`. The other two screens always open at 28 days |
| `cacheTtlSeconds`    | No       | `300`                   | How long an answer from Sleuth is reused before asking again                                                                                 |
| `apiUrl`             | No       | `https://app.sleuth.io` | Where Sleuth is. Change it only if you were given a different address                                                                        |

### Keeping the API key safe

Put the key in an environment variable and refer to it, as shown above, so it is not saved in a file
that gets committed.

If `organizationId` or `apiKey` is missing, the rest of Backstage still starts. Only the Sleuth screens
are affected: they show "Sleuth DORA plugin is not configured" and name the missing setting.

### About `environment`

Use the environment's **slug** as Sleuth shows it in addresses, usually all lower case, such as
`production`. The team screen matches the environment by name; that works when the name and the slug
differ only in capital letters, as with "Production" and `production`. If an environment's name and
slug are different words, the team screen may show no data for it; this case has not been tested.

## Component settings

Add these to a component's `catalog-info.yaml` to link it to Sleuth:

```yaml
metadata:
  annotations:
    sleuth.io/project-slug: my-project
    sleuth.io/code-deployment-slug: payments-api
    sleuth.io/environment: production
```

| Annotation                       | If you leave it out                                                                        |
| -------------------------------- | ------------------------------------------------------------------------------------------ |
| `sleuth.io/project-slug`         | `defaultProjectSlug` from the app settings is used, and `sleuth` if that is not set either |
| `sleuth.io/code-deployment-slug` | The component's own name is used                                                           |
| `sleuth.io/environment`          | `environment` from the app settings is used, and `production` if that is not set either    |

The Sleuth tab is shown on components whose type is `service` or `website`.

## Teams

There is nothing to configure for teams, but names must line up: the team screen looks up each group in
the signed-in person's `memberOf` list as a Sleuth team with the same slug.

```yaml
# a user entry in the catalog
kind: User
metadata:
  name: jane
spec:
  memberOf: [payments, platform] # Sleuth needs teams with the slugs "payments" and "platform"
```
