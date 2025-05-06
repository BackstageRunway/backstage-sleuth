import { createRouteRef, createSubRouteRef } from '@backstage/core-plugin-api';

export const rootRouteRef = createRouteRef({
  id: 'dora-frontend',
});

export const innerRouteRef = createSubRouteRef({
  id: 'dora-get-metric',
  parent: rootRouteRef,
  path: '/dora/metric',
});
