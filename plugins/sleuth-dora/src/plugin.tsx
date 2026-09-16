import {
  ApiBlueprint,
  createFrontendPlugin,
  PageBlueprint,
} from '@backstage/frontend-plugin-api';
import { compatWrapper } from '@backstage/core-compat-api';
import { EntityContentBlueprint } from '@backstage/plugin-catalog-react/alpha';
import type { Entity } from '@backstage/catalog-model';
import {
  configApiRef,
  createApiFactory,
  discoveryApiRef,
  identityApiRef,
} from '@backstage/core-plugin-api';
import DashboardIcon from '@material-ui/icons/Dashboard';
import AssessmentIcon from '@material-ui/icons/Assessment';
import { doraBackendApiRef, DORABackendClientImpl } from './api/DORABackendClient';
import { doraEltRouteRef, doraTeamRouteRef } from './routes';

// Utility APIs are a shared concept across both frontend systems, so the
// existing createApiFactory(...) plugs directly into ApiBlueprint unchanged
// - this is exactly what @backstage/core-compat-api's convertLegacyPlugin
// does under the hood for a legacy plugin's `apis` array.
const doraBackendApi = ApiBlueprint.make({
  name: doraBackendApiRef.id,
  params: define =>
    define(
      createApiFactory({
        api: doraBackendApiRef,
        deps: {
          configApi: configApiRef,
          identityApi: identityApiRef,
          discoveryApi: discoveryApiRef,
        },
        factory: ({ configApi, identityApi, discoveryApi }) =>
          new DORABackendClientImpl({ configApi, identityApi, discoveryApi }),
      }),
    ),
});

// The dashboards/entity content still use @backstage/core-plugin-api hooks
// internally (useApi, useDoraConfig, etc.), so each loader wraps its
// element in compatWrapper - a normal, permanent pattern for a subtree
// that consumes old-system Utility API context, not a partial migration.

const doraEltPage = PageBlueprint.make({
  name: 'dora-elt',
  params: {
    path: '/dora-elt',
    title: 'Sleuth - ELT',
    icon: <DashboardIcon />,
    routeRef: doraEltRouteRef,
    loader: () =>
      import('./components/dora/ExecutiveDashboard').then(m =>
        compatWrapper(<m.ExecutiveDashboard />),
      ),
  },
});

const doraTeamPage = PageBlueprint.make({
  name: 'dora-team',
  params: {
    path: '/dora-team',
    title: 'Sleuth - Team',
    icon: <AssessmentIcon />,
    routeRef: doraTeamRouteRef,
    loader: () =>
      import('./components/dora/LeadDashboard/LeadDashboard').then(m =>
        compatWrapper(<m.LeadDashboard />),
      ),
  },
});

const sleuthEntityContent = EntityContentBlueprint.make({
  name: 'sleuth',
  params: {
    path: 'sleuth',
    title: 'Sleuth',
    filter: (entity: Entity) =>
      entity.kind === 'Component' &&
      ['service', 'website'].includes(
        (entity.spec as { type?: string } | undefined)?.type ?? '',
      ),
    loader: () =>
      import('./components/dora/EntityDashboard').then(m =>
        compatWrapper(<m.EntityDashboard />),
      ),
  },
});

export const doraFrontendPlugin = createFrontendPlugin({
  pluginId: 'sleuth-dora',
  routes: {
    doraElt: doraEltRouteRef,
    doraTeam: doraTeamRouteRef,
  },
  extensions: [doraBackendApi, doraEltPage, doraTeamPage, sleuthEntityContent],
});
