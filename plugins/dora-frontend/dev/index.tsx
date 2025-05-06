import { createDevApp } from '@backstage/dev-utils';
import { doraFrontendPlugin, DoraFrontendPage } from '../src/plugin';

createDevApp()
  .registerPlugin(doraFrontendPlugin)
  .addPage({
    element: <DoraFrontendPage />,
    title: 'Root Page',
    path: '/dora-frontend',
  })
  .render();
