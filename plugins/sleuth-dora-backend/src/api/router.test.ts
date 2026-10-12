import express from 'express';
import request from 'supertest';
import { mockServices } from '@backstage/backend-test-utils';
import { createRouter } from './router';
import { MetricsService } from '../application/services/MetricsService';
import { DoraMetricsError } from '../domain/models/DoraMetrics';

const appWith = async (metricsService: Partial<MetricsService>) => {
  const app = express();
  app.use(
    await createRouter({
      metricsService: metricsService as MetricsService,
      logger: mockServices.logger.mock(),
    }),
  );
  return app;
};

const QUERY = 'environment=production&deploymentId=dora&timeRange=last28days';

describe('router', () => {
  it('explains an unknown code deployment instead of passing on the raw Sleuth error', async () => {
    const unknown = new DoraMetricsError(
      "Failed to query Sleuth API: No deployments found for `['dora']` slugs",
      'PROVIDER_ERROR',
    );
    const app = await appWith({
      getProjectMetrics: jest.fn().mockRejectedValue(unknown),
      getProjectMetricsInsights: jest.fn().mockRejectedValue(unknown),
    });

    for (const path of ['/metrics/my-project', '/metrics-insights/my-project']) {
      const res = await request(app).get(`${path}?${QUERY}`);
      expect(res.status).toBe(404);
      expect(res.body.error).toContain('Sleuth has no code deployment "dora" in project "my-project"');
      expect(res.body.error).toContain('sleuth.io/code-deployment-slug');
    }
  });

  it('still reports other Sleuth failures as a bad gateway with the reason', async () => {
    const app = await appWith({
      getProjectMetrics: jest
        .fn()
        .mockRejectedValue(new DoraMetricsError('Failed to query Sleuth API: PERMISSION_DENIED', 'PROVIDER_ERROR')),
    });

    const res = await request(app).get(`/metrics/my-project?${QUERY}`);

    expect(res.status).toBe(502);
    expect(res.body.error).toContain('PERMISSION_DENIED');
  });

  it('rejects a zero-day time range before calling Sleuth', async () => {
    const getProjectMetrics = jest.fn();
    const app = await appWith({ getProjectMetrics });

    const res = await request(app).get('/metrics/my-project?environment=production&deploymentId=&timeRange=last0days');

    expect(res.status).toBe(400);
    expect(getProjectMetrics).not.toHaveBeenCalled();
  });
});
