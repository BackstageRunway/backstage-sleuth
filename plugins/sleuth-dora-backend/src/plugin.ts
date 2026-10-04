import { createBackendPlugin } from '@backstage/backend-plugin-api';
import { coreServices } from '@backstage/backend-plugin-api';
import { Router } from 'express';
import { createRouter } from './api/router';
import { SleuthClient } from './infrastructure/sleuth/SleuthClient';
import { MetricsService } from './application/services/MetricsService';

export const doraBackendPlugin = createBackendPlugin({
  pluginId: 'sleuth-dora-backend',
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
        const sleuthApiKey = config.getOptionalString('dora.sleuth.apiKey');
        const sleuthApiUrl = config.getOptionalString('dora.sleuth.apiUrl') ?? 'https://app.sleuth.io';
        const organizationId = config.getOptionalString('dora.sleuth.organizationId');
        const cacheTtlSeconds = config.getOptionalNumber('dora.sleuth.cacheTtlSeconds');

        // A missing key should disable this plugin, not stop every other backend plugin from starting
        if (!sleuthApiKey || !organizationId) {
          const missing = [!sleuthApiKey && 'dora.sleuth.apiKey', !organizationId && 'dora.sleuth.organizationId']
            .filter(Boolean)
            .join(' and ');
          logger.warn(`Sleuth DORA plugin is disabled: ${missing} is not set`);
          const disabled = Router();
          disabled.use((_req, res) => {
            res.status(503).json({ error: `Sleuth DORA plugin is not configured: ${missing} is not set` });
          });
          httpRouter.use(disabled);
          return;
        }

        const client = new SleuthClient(sleuthApiKey, sleuthApiUrl, organizationId, cacheTtlSeconds);
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