import { createApp } from '@backstage/frontend-defaults';
import catalogPlugin from '@backstage/plugin-catalog/alpha';
import { doraFrontendPlugin } from '@backstagerunway/plugin-sleuth-dora';
import { navModule } from './modules/nav';
import { homeModule } from './modules/home';

export default createApp({
  features: [catalogPlugin, navModule, homeModule, doraFrontendPlugin],
});
