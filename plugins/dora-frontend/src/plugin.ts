import {
  configApiRef,
  createApiFactory,
  createComponentExtension,
  createPlugin,
  createRoutableExtension,
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
      },
      factory: ({ configApi, identityApi }) =>
        new DORABackendClientImpl({ configApi, identityApi }),
    })
  ],
});

// this is a routable page
export const DoraFrontendPage = doraFrontendPlugin.provide(
  createRoutableExtension({
    name: 'DoraFrontendPage',
    component: () =>
      import('./components/ExampleComponent').then(m => m.ExampleComponent),
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

export const DoraPerformanceComponent = doraFrontendPlugin.provide(
  createComponentExtension({
    name: 'PerformanceComponent',
    component: {
      lazy: () => import('./components/PerformanceTable/EntityDoraMetrics').then(m => m.EntityDoraMetrics),
    },
  }),
);
