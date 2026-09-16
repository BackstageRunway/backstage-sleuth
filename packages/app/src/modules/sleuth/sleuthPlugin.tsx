import { createRouteRef, PageBlueprint } from '@backstage/frontend-plugin-api';
import { compatWrapper, convertLegacyPlugin } from '@backstage/core-compat-api';
import { EntityContentBlueprint } from '@backstage/plugin-catalog-react/alpha';
import type { Entity } from '@backstage/catalog-model';
import DashboardIcon from '@material-ui/icons/Dashboard';
import AssessmentIcon from '@material-ui/icons/Assessment';
import { doraFrontendPlugin, DoraPerformanceComponent } from '@backstagerunway/plugin-sleuth-dora';
import { ExecutiveDashboard } from '@backstagerunway/plugin-sleuth-dora/src/components/dora/ExecutiveDashboard';
import { LeadDashboard } from '@backstagerunway/plugin-sleuth-dora/src/components/dora/LeadDashboard';

// DoraELTPage/DoraLeadPage (the old system's createRoutableExtension-wrapped
// pages) can't be rendered here: their RoutableExtensionWrapper requires its
// mount-point routeRef to be "discovered" by walking the old system's
// <FlatRoutes> JSX tree at app bootstrap, which doesn't exist in the new
// frontend system (this affects convertLegacyPageExtension identically,
// since it does the same compatWrapper(element) under the hood). Rendering
// the underlying dashboard components directly sidesteps that entirely,
// since they don't call useRouteRef.
//
// Each page gets its own new-system routeRef (rather than reusing the
// legacy plugin's shared rootRouteRef) because AppNav only lists a page in
// the sidebar if it resolves a routeRef, and one routeRef can't resolve to
// two different pages.
const doraEltRouteRef = createRouteRef();
const doraTeamRouteRef = createRouteRef();

const doraEltPage = PageBlueprint.make({
  name: 'dora-elt',
  params: {
    path: '/dora-elt',
    title: 'Sleuth - ELT',
    icon: <DashboardIcon />,
    routeRef: doraEltRouteRef,
    loader: async () => compatWrapper(<ExecutiveDashboard />),
  },
});

const doraTeamPage = PageBlueprint.make({
  name: 'dora-team',
  params: {
    path: '/dora-team',
    title: 'Sleuth - Team',
    icon: <AssessmentIcon />,
    routeRef: doraTeamRouteRef,
    loader: async () => compatWrapper(<LeadDashboard />),
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
    loader: async () => compatWrapper(<DoraPerformanceComponent />),
  },
});

export const sleuthPlugin = convertLegacyPlugin(doraFrontendPlugin, {
  extensions: [doraEltPage, doraTeamPage, sleuthEntityContent],
});
