import type { Entity } from '@backstage/catalog-model';
import {
  configApiRef,
  createApiFactory,
  createComponentExtension,
  createPlugin,
  createRoutableExtension,
  createRouteRef,
  discoveryApiRef,
  identityApiRef,
} from '@backstage/core-plugin-api';
import { doraBackendApiRef, DORABackendClientImpl } from './api/DORABackendClient';

// Exports for apps still on the legacy frontend system, which cannot install
// doraFrontendPlugin as a feature. They mount the pages and the entity tab by hand:
//
//   <Route path="/dora-elt" element={<DoraELTPage />} />
//   <Route path="/dora-team" element={<DoraLeadPage />} />
//   <EntityLayout.Route path="/sleuth" title="Sleuth" if={isSleuthDoraAvailable}>
//     <DoraPerformanceComponent />
//   </EntityLayout.Route>

const legacyEltRouteRef = createRouteRef({ id: 'sleuth-dora:elt' });
const legacyTeamRouteRef = createRouteRef({ id: 'sleuth-dora:team' });

export const doraLegacyPlugin = createPlugin({
  id: 'sleuth-dora',
  routes: {
    doraElt: legacyEltRouteRef,
    doraTeam: legacyTeamRouteRef,
  },
  apis: [
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
  ],
});

export const DoraELTPage = doraLegacyPlugin.provide(
  createRoutableExtension({
    name: 'DoraELTPage',
    component: () =>
      import('./components/dora/ExecutiveDashboard').then(m => m.ExecutiveDashboard),
    mountPoint: legacyEltRouteRef,
  }),
);

export const DoraLeadPage = doraLegacyPlugin.provide(
  createRoutableExtension({
    name: 'DoraLeadPage',
    component: () =>
      import('./components/dora/LeadDashboard/LeadDashboard').then(m => m.LeadDashboard),
    mountPoint: legacyTeamRouteRef,
  }),
);

export const DoraPerformanceComponent = doraLegacyPlugin.provide(
  createComponentExtension({
    name: 'DoraPerformanceComponent',
    component: {
      lazy: () => import('./components/dora/EntityDashboard').then(m => m.EntityDashboard),
    },
  }),
);

// The same rule the new-system entity tab uses to decide where the Sleuth tab appears
export const isSleuthDoraAvailable = (entity: Entity) =>
  entity.kind === 'Component' &&
  ['service', 'website'].includes((entity.spec as { type?: string } | undefined)?.type ?? '');
