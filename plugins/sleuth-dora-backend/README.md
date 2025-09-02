# @backstagerunway/plugin-sleuth-dora-backend

A Backstage backend plugin that provides DORA (DevOps Research and Assessment) metrics integration with Sleuth.io. This plugin fetches and serves DORA metrics data to the frontend components.

## Features

- **Sleuth.io Integration**: Connects to Sleuth.io API to fetch DORA metrics
- **RESTful API**: Provides endpoints for retrieving metrics data
- **Configurable**: Supports custom Sleuth.io organization and API configuration
- **Authentication**: Integrates with Backstage's authentication system

## Prerequisites

- A Backstage application
- A Sleuth.io account with API access
- Your Sleuth.io API key and organization ID

## Installation

1. Install the plugin in your backend package:

```bash
cd packages/backend
yarn add @backstagerunway/plugin-sleuth-dora-backend
```

2. Add the plugin to your backend:

```typescript
// packages/backend/src/index.ts
import { createBackend } from '@backstage/backend-defaults';

const backend = createBackend();

// Add the DORA backend plugin
backend.add(import('@backstagerunway/plugin-sleuth-dora-backend'));

backend.start();
```

## Configuration

Add the following configuration to your `app-config.yaml`:

```yaml
dora:
  sleuth:
    organizationId: 'your-sleuth-organization-id'
    apiKey: 'your-sleuth-api-key-here'
    # Optional frontend-visible defaults
    environment: 'production'
    defaultProjectSlug: 'your-default-project'
    # apiUrl is optional - defaults to 'https://app.sleuth.io' if not specified
    # apiUrl: 'https://app.sleuth.io'
```

### Configuration Options & Precedence

Required (backend-only):
- `organizationId`: Your Sleuth.io organization identifier
- `apiKey`: Your Sleuth.io API key for authentication

Optional (frontend-visible):
- `environment` (default: `production`)
- `defaultProjectSlug` (default: `sleuth`)
- `defaultTimeRange` (default: `last28days`)
- `apiUrl` (default: `https://app.sleuth.io`)

Frontend resolution order:
1. Entity annotations (if present)
2. App config (keys above)
3. Built-in defaults

## API Endpoints

The plugin provides the following REST endpoints:

- `GET /api/dora/metrics` - Retrieve DORA metrics for the organization
- `GET /api/dora/metrics/teams` - Retrieve DORA metrics for specific teams
- `GET /api/dora/metrics/entity` - Retrieve DORA metrics for a specific entity/project

## Development

### Running the Plugin Locally

1. Clone the repository
2. Install dependencies: `yarn install`
3. Configure your Sleuth.io credentials in `app-config.yaml`
4. Start the backend: `yarn start`

### Testing

```bash
yarn test
```

## Troubleshooting

### Common Issues

1. **API Key Issues**: Ensure your Sleuth.io API key is valid and has the necessary permissions
2. **Organization ID**: Verify your organization ID is correct in the configuration
3. **Network Issues**: Check that your backend can reach the Sleuth.io API

### Logs

The plugin logs important events and errors. Check your backend logs for debugging information.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the Apache 2.0 License.
