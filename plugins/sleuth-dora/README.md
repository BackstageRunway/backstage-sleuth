# @backstagerunway/plugin-sleuth-dora

A Backstage frontend plugin that provides DORA (DevOps Research and Assessment) metrics visualization with Sleuth.io integration. This plugin offers three different views for different user roles and use cases.

## Features

- **Executive Dashboard**: High-level organizational DORA metrics and quarterly health overview
- **Lead Dashboard**: Team-focused DORA metrics with team selection and performance tracking
- **Entity Dashboard**: Project-specific DORA metrics embedded in entity pages
- **Time Range Selection**: Configurable time periods for metrics analysis
- **Real-time Data**: Live metrics from Sleuth.io integration

## Prerequisites

- A Backstage application with the [@backstagerunway/plugin-sleuth-dora-backend](../dora-backend) installed and configured
- Sleuth.io account with API access
- Proper configuration in `app-config.yaml`

## Installation

1. Install the frontend plugin in your app package:

```bash
cd packages/app
yarn add @backstagerunway/plugin-sleuth-dora
```

2. Install the backend plugin (required):

```bash
cd packages/backend
yarn add @backstagerunway/plugin-sleuth-dora-backend
```

3. Configure the backend plugin in `packages/backend/src/index.ts`:

```typescript
import { createBackend } from '@backstage/backend-defaults';

const backend = createBackend();

// Add the DORA backend plugin
backend.add(import('@backstagerunway/plugin-sleuth-dora-backend'));

backend.start();
```

4. Add configuration to your `app-config.yaml`:

```yaml
dora:
  sleuth:
    organizationId: 'your-sleuth-organization-id'
    apiUrl: 'https://app.sleuth.io'
    apiKey: 'your-sleuth-api-key-here'
```

## Available Views

### 1. Executive Dashboard (DoraELTPage)

**Purpose**: Provides executive-level overview of organizational DORA metrics and quarterly health trends.

**Features**:
- Executive summary with key DORA metrics
- Quarterly health overview
- Organization-wide trend analysis
- Time range selection for historical data

![Executive Dashboard Main View](docs/screenshots/executive-dashboard-main.png)
*Executive Dashboard showing organizational DORA metrics overview*


**Installation**:

```typescript
// packages/app/src/App.tsx
import { DoraELTPage } from '@backstagerunway/plugin-sleuth-dora';

// Add the route
<Route path="/dora-elt" element={<DoraELTPage />} />
```

```typescript
// packages/app/src/components/Root/Root.tsx
import { CreateComponentIcon } from '@backstage/core-components';

// Add to sidebar navigation
<SidebarItem icon={CreateComponentIcon} to="dora-elt" text="Sleuth - ELT" />
```

### 2. Lead Dashboard (DoraLeadPage)

**Purpose**: Provides team leaders with detailed team performance metrics and the ability to compare teams.

**Features**:
- Team performance overview
- Team selector for comparing specific teams
- All teams view for comprehensive analysis
- Time range selection
- User team filtering based on Backstage catalog

![Lead Dashboard Team Selector](docs/screenshots/lead-dashboard-team-selector.png)
*Team selector dropdown for comparing specific teams*

![Lead Dashboard Performance](docs/screenshots/lead-dashboard-performance.png)
*Team performance overview with metrics comparison*

**Installation**:

```typescript
// packages/app/src/App.tsx
import { DoraLeadPage } from '@backstagerunway/plugin-sleuth-dora';

// Add the route
<Route path="/dora-lead" element={<DoraLeadPage />} />
```

```typescript
// packages/app/src/components/Root/Root.tsx
import { CreateComponentIcon } from '@backstage/core-components';

// Add to sidebar navigation
<SidebarItem icon={CreateComponentIcon} to="dora-lead" text="Sleuth - Lead" />
```

### 3. Entity Dashboard (DoraPerformanceComponent)

**Purpose**: Embeds DORA metrics directly into entity pages for project-specific analysis.

**Features**:
- Project-specific DORA metrics
- Entity-based filtering
- Time range selection
- Performance trends and insights
- Embeddable component for any entity type

![Entity Dashboard Sleuth Tab](docs/screenshots/entity-dashboard-sleuth-tab.png)
*Entity page with Sleuth tab showing project-specific metrics*


**Installation**:

```typescript
// packages/app/src/components/catalog/EntityPage.tsx
import { DoraPerformanceComponent } from '@backstagerunway/plugin-sleuth-dora/src/plugin';

// Add the component content
const sleuthContent = (
  <Grid container spacing={3} alignItems="stretch">
    <Grid item xs={12}>
      <DoraPerformanceComponent />
    </Grid>
  </Grid>
);

// Add the route to your entity layout
<EntityLayout.Route path="/sleuth" title="Sleuth">
  {sleuthContent}
</EntityLayout.Route>
```

**Entity Configuration**: To use the Entity Dashboard, your entities must have the `sleuth.io/project-slug` annotation:

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: my-component
  annotations:
    sleuth.io/project-slug: 'your-sleuth-project-slug'
spec:
  type: service
  lifecycle: production
  owner: team-a
```

## Complete Setup Example

Here's a complete example of setting up all three views:

![Sidebar Navigation](docs/screenshots/sidebar-navigation.png)
*Sidebar navigation showing DORA menu items*


### 1. App.tsx Configuration

```typescript
// packages/app/src/App.tsx
import { DoraELTPage, DoraLeadPage } from '@backstagerunway/plugin-sleuth-dora';

// Inside your Routes component
<Routes>
  {/* ... other routes ... */}
  <Route path="/dora-elt" element={<DoraELTPage />} />
  <Route path="/dora-lead" element={<DoraLeadPage />} />
</Routes>
```

### 2. Root.tsx Configuration

```typescript
// packages/app/src/components/Root/Root.tsx
import { CreateComponentIcon } from '@backstage/core-components';

// Inside your Sidebar component
<SidebarItem icon={CreateComponentIcon} to="dora-elt" text="Sleuth - ELT" />
<SidebarItem icon={CreateComponentIcon} to="dora-lead" text="Sleuth - Lead" />
```

### 3. EntityPage.tsx Configuration

```typescript
// packages/app/src/components/catalog/EntityPage.tsx
import { DoraPerformanceComponent } from '@backstagerunway/plugin-sleuth-dora/src/plugin';

// Add the component content
const sleuthContent = (
  <Grid container spacing={3} alignItems="stretch">
    <Grid item xs={12}>
      <DoraPerformanceComponent />
    </Grid>
  </Grid>
);

// Add the route to your entity layout
<EntityLayout.Route path="/sleuth" title="Sleuth">
  {sleuthContent}
</EntityLayout.Route>
```

## Configuration

### Required Configuration

The plugin requires the following configuration in your `app-config.yaml`:

```yaml
dora:
  sleuth:
    organizationId: 'your-sleuth-organization-id'
    apiUrl: 'https://app.sleuth.io'
    apiKey: 'your-sleuth-api-key-here'
```

### Entity Annotations

For the Entity Dashboard to work, your entities must include:

```yaml
metadata:
  annotations:
    sleuth.io/project-slug: 'your-sleuth-project-slug'
```

## Development

### Running the Plugin Locally

1. Clone the repository
2. Install dependencies: `yarn install`
3. Configure your Sleuth.io credentials
4. Start the development server: `yarn start`

### Testing

```bash
yarn test
```

## Troubleshooting

### Common Issues

1. **Backend Plugin Not Installed**: Ensure the backend plugin is properly installed and configured
2. **Missing Configuration**: Verify your `app-config.yaml` has the required Sleuth.io configuration
3. **Entity Annotations**: Check that entities have the required `sleuth.io/project-slug` annotation
4. **API Key Issues**: Ensure your Sleuth.io API key is valid and has proper permissions

### Error Messages

- **"No Sleuth project Slug found"**: Add the `sleuth.io/project-slug` annotation to your entity
- **"Failed to load metrics"**: Check your backend configuration and Sleuth.io API credentials
- **"No teams found"**: Verify your user has proper team associations in Backstage

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the Apache 2.0 License.
