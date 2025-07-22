import {
  configApiRef,
  createApiFactory,
  createComponentExtension,
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
  identityApiRef,
} from '@backstage/core-plugin-api';
import { doraBackendApiRef, DORABackendClientImpl } from './api/DORABackendClient';
import { innerRouteRef, rootRouteRef } from './routes';

export const doraFrontendPlugin = createPlugin({
  id: 'dora-frontend',
  routes: {
    root: rootRouteRef,
    innerRoot: innerRouteRef,
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
        new DORABackendClientImpl({  configApi, identityApi, discoveryApi }),
    })
  ],
});

// this is a routable page
export const DoraELTPage = doraFrontendPlugin.provide(
  createRoutableExtension({
    name: 'DoraELTPage',
    component: () =>
      import('./components/dora/elt/ELTDashboard').then(m => m.ELTDashboard),
    mountPoint: rootRouteRef,
  }),
);

// this is a routable page
export const DoraLeadPage = doraFrontendPlugin.provide(
  createRoutableExtension({
    name: 'DoraLeadPage',
    component: () =>
      import('./components/dora/lead/LeadDashboard').then(m => m.LeadDashboard),
    mountPoint: rootRouteRef,
  }),
);


// this is an embeddable exported component, can be embeded in any page or plugin like home, Entity
export const DoraDashboard = doraFrontendPlugin.provide(
  createComponentExtension({
    name: 'Dashboard',
    component: {
      lazy: () => import('./components/DoraDashboard').then(m => m.DoraDashboard),
    },
  }),
);

// this is an embeddable exported component, can be embeded in any page or plugin like home, Entity
export const DoraPerformanceComponent = doraFrontendPlugin.provide(
  createComponentExtension({
    name: 'PerformanceComponent',
    component: {
      lazy: () => import('./components/dora/EntityDoraMetrics').then(m => m.EntityDoraMetrics),
    },
  }),
);
