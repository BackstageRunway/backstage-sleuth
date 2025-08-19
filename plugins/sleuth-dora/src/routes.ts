import { createRouteRef } from '@backstage/core-plugin-api';

export const rootRouteRef = createRouteRef({
  id: 'sleuth-dora',
});

export const innerRouteRef = createRouteRef({
  id: 'sleuth-dora-inner',
});
