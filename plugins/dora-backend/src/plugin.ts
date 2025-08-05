import { createBackendPlugin } from '@backstage/backend-plugin-api';
import { coreServices } from '@backstage/backend-plugin-api';
import { createRouter } from './api/router';
import { SleuthClient } from './infrastructure/sleuth/SleuthClient';
import { MetricsService } from './application/services/MetricsService';

export const doraBackendPlugin = createBackendPlugin({
  pluginId: 'dora-backend',
  register(env) {
    env.registerInit({
      deps: {
        //database: coreServices.database,
        httpAuth: coreServices.httpAuth,
        httpRouter: coreServices.httpRouter,
        logger: coreServices.logger,
        config: coreServices.rootConfig,
      },
      async init({httpRouter, logger, config }) {
        const sleuthApiKey = config.getString('dora.sleuth.apiKey');
        const sleuthApiUrl = config.getString('dora.sleuth.apiUrl');
        const organizationId = config.getString('dora.sleuth.organizationId');
        const client = new SleuthClient(sleuthApiKey, sleuthApiUrl, organizationId);
        const metricsService = new MetricsService(client, logger);

      
        httpRouter.use(
          await createRouter({
            metricsService,
            logger,
          }),
        );
      },
    });
  },
}); 