import { mockServices, startTestBackend } from '@backstage/backend-test-utils';
import { doraBackendPlugin } from './plugin';
import request from 'supertest';

describe('plugin', () => {
  it('starts without an API key and reports that it is not configured', async () => {
    const { server } = await startTestBackend({
      features: [
        doraBackendPlugin,
        mockServices.rootConfig.factory({
          data: { dora: { sleuth: { organizationId: 'my-org' } } },
        }),
      ],
    });

    const res = await request(server).get(
      '/api/sleuth-dora-backend/org-trend-metrics?timeRange=last7days',
    );

    expect(res.status).toBe(503);
    expect(res.body.error).toContain('dora.sleuth.apiKey is not set');
  });

  it('rejects an invalid time range before calling Sleuth', async () => {
    const { server } = await startTestBackend({
      features: [
        doraBackendPlugin,
        mockServices.rootConfig.factory({
          data: { dora: { sleuth: { organizationId: 'my-org', apiKey: 'test-key' } } },
        }),
      ],
    });

    const res = await request(server).get(
      '/api/sleuth-dora-backend/org-trend-metrics?timeRange=yesterday',
    );

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid request parameters');
  });
});
