import { createDevApp } from '@backstage/dev-utils';
import { EntityDashboard, ExecutiveDashboard, LeadDashboard } from '../src/index';

// doraFrontendPlugin is a native New Frontend System FrontendPlugin now, so
// it can't be registered via createDevApp/.registerPlugin (old-system
// tooling). This just previews the raw dashboard components directly.
createDevApp()
  .addPage({
    element: <EntityDashboard />,
    title: 'Entity Dashboard',
    path: '/sleuth-dora',
  })
  .addPage({
    element: <ExecutiveDashboard />,
    title: 'Executive Dashboard',
    path: '/sleuth-dora/elt',
  })
  .addPage({
    element: <LeadDashboard />,
    title: 'Lead Dashboard',
    path: '/sleuth-dora/team',
  })
  .render();
