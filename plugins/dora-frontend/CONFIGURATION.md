# DORA Plugin Configuration

## Overview

The DORA plugin requires configuration in your `app-config.yaml` file to function properly. This document explains how to configure the plugin.

## Configuration Options

### Frontend Configuration

Add the following section to your `app-config.yaml`:

```yaml
dora:
  # Organization ID for Sleuth/DORA metrics
  orgId: 'sleuth'
  
  # Environment for metrics (e.g., 'production', 'staging', 'development')
  environment: 'production'
  
  # Deployment identifier (e.g., 'application', 'service')
  deployment: 'application'
  
  # Default time range for metrics (e.g., 'last7days', 'last14days', 'last28days', 'last90days')
  defaultTimeRange: 'last28days'
```

### Backend Configuration

Add the following section to your `app-config.yaml`:

```yaml
dora:
  sleuth:
    # Sleuth API key for authentication
    apiKey: 'your-sleuth-api-key-here'
```

## Configuration Keys

| Key | Description | Default Value |
|-----|-------------|---------------|
| `dora.orgId` | Organization ID for Sleuth/DORA metrics | `'sleuth'` |
| `dora.environment` | Environment for metrics | `'production'` |
| `dora.deployment` | Deployment identifier | `'application'` |
| `dora.defaultTimeRange` | Default time range for metrics | `'last28days'` |
| `dora.sleuth.apiKey` | Sleuth API key for authentication | Required |

## Entity-Specific Configuration

You can override the global configuration for specific entities by adding annotations to your entity YAML files:

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: my-service
  annotations:
    sleuth.io/org-id: 'my-org'
    sleuth.io/project-slug: 'my-project'
    sleuth.io/environment: 'production'
    sleuth.io/deployment: 'my-service'
spec:
  type: service
  lifecycle: production
  owner: team-a
```

## Environment Variables

For production deployments, you can use environment variables for sensitive configuration:

```yaml
dora:
  sleuth:
    apiKey: ${SLEUTH_API_KEY}
```

## Troubleshooting

### Missing Configuration Error

If you see errors like "Missing required config value at 'dora.orgId'", make sure you have added the configuration section to your `app-config.yaml` file.

### Default Values

The plugin will use default values if configuration is not provided:
- `orgId`: 'sleuth'
- `environment`: 'production'
- `deployment`: 'application'
- `defaultTimeRange`: 'last28days'

### Validation

The plugin validates configuration values and will log warnings for invalid values. Check your browser console and backend logs for configuration-related warnings. 