import { createDevApp } from '@backstage/dev-utils';
import { doraFrontendPlugin, DoraPerformanceComponent } from '../src/plugin';

createDevApp()
  .registerPlugin(doraFrontendPlugin)
  .addPage({
    element: <DoraPerformanceComponent />,
    title: 'Root Page',
    path: '/sleuth-dora',
  })
  .render();
