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

  describe('project metrics', () => {
    it('passes the project, environment, code deployment and range to the service', async () => {
      const getProjectMetrics = jest.fn().mockResolvedValue({ project: {} });
      const app = await appWith({ getProjectMetrics });

      const res = await request(app).get(`/metrics/my-project?${QUERY}`);

      expect(res.status).toBe(200);
      expect(getProjectMetrics).toHaveBeenCalledWith('my-project', 'production', 'dora', 'last28days');
    });

    it('accepts an empty code deployment, meaning the whole project', async () => {
      const getProjectMetrics = jest.fn().mockResolvedValue({ project: {} });
      const app = await appWith({ getProjectMetrics });

      await request(app).get('/metrics/my-project?environment=production&deploymentId=&timeRange=last7days');

      expect(getProjectMetrics).toHaveBeenCalledWith('my-project', 'production', '', 'last7days');
    });

    it.each(['environment=&deploymentId=x&timeRange=last7days', 'environment=production&timeRange=last7days'])(
      'rejects "%s"',
      async query => {
        const getProjectMetrics = jest.fn();
        const app = await appWith({ getProjectMetrics });

        const res = await request(app).get(`/metrics/my-project?${query}`);

        expect(res.status).toBe(400);
        expect(getProjectMetrics).not.toHaveBeenCalled();
      },
    );

    it('answers not found when Sleuth has no data for the project', async () => {
      const app = await appWith({
        getProjectMetrics: jest.fn().mockRejectedValue(new Error('No metrics data available')),
      });

      const res = await request(app).get(`/metrics/my-project?${QUERY}`);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('No metrics data available');
    });

    it('hides the detail of an unexpected failure', async () => {
      const app = await appWith({
        getProjectMetrics: jest.fn().mockRejectedValue(new Error('connection string postgres://secret')),
      });

      const res = await request(app).get(`/metrics/my-project?${QUERY}`);

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Failed to fetch metrics');
    });
  });

  describe('insights', () => {
    it('passes the same parameters to the insights service', async () => {
      const getProjectMetricsInsights = jest.fn().mockResolvedValue({ project: { insights: [] } });
      const app = await appWith({ getProjectMetricsInsights });

      const res = await request(app).get(`/metrics-insights/my-project?${QUERY}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ project: { insights: [] } });
      expect(getProjectMetricsInsights).toHaveBeenCalledWith('my-project', 'production', 'dora', 'last28days');
    });
  });

  describe('organisation trend', () => {
    it('returns what the service found for the range', async () => {
      const organization = { previousRecap: { numOfDeploys: 80 }, metricsRecapWithQuarters: { quarters: [] } };
      const getOrganizationTrendMetrics = jest.fn().mockResolvedValue({ organization });
      const app = await appWith({ getOrganizationTrendMetrics });

      const res = await request(app).get('/org-trend-metrics?timeRange=last90days');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ organization });
      expect(getOrganizationTrendMetrics).toHaveBeenCalledWith('last90days');
    });

    it("answers bad gateway with Sleuth's reason when Sleuth fails", async () => {
      const app = await appWith({
        getOrganizationTrendMetrics: jest
          .fn()
          .mockRejectedValue(new DoraMetricsError('Failed to query Sleuth API for trend metrics: HTTP 401', 'PROVIDER_ERROR')),
      });

      const res = await request(app).get('/org-trend-metrics?timeRange=last28days');

      expect(res.status).toBe(502);
      expect(res.body.error).toContain('HTTP 401');
    });
  });

  describe('team metrics', () => {
    const body = { teamSlugs: ['admins', 'developers'], environment: 'production', deploymentId: '', timeRange: 'last28days' };

    it('passes the teams, environment and range to the service', async () => {
      const getBatchTeamMetrics = jest.fn().mockResolvedValue({ teams: [{ name: 'admins' }] });
      const app = await appWith({ getBatchTeamMetrics });

      const res = await request(app).post('/batch-team-metrics').send(body);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ teams: [{ name: 'admins' }] });
      expect(getBatchTeamMetrics).toHaveBeenCalledWith(['admins', 'developers'], 'production', '', 'last28days');
    });

    it.each([
      ['no teams', { ...body, teamSlugs: undefined }],
      ['an empty team list', { ...body, teamSlugs: [] }],
      ['teams that are not a list', { ...body, teamSlugs: 'admins' }],
      ['no environment', { ...body, environment: undefined }],
      ['no time range', { ...body, timeRange: undefined }],
      ['a time range it cannot read', { ...body, timeRange: 'yesterday' }],
      ['a zero-day time range', { ...body, timeRange: 'last0days' }],
    ])('rejects a request with %s', async (_case, invalid) => {
      const getBatchTeamMetrics = jest.fn();
      const app = await appWith({ getBatchTeamMetrics });

      const res = await request(app).post('/batch-team-metrics').send(invalid);

      expect(res.status).toBe(400);
      expect(getBatchTeamMetrics).not.toHaveBeenCalled();
    });

    it('answers not found when Sleuth knows none of the teams', async () => {
      const app = await appWith({
        getBatchTeamMetrics: jest.fn().mockRejectedValue(new Error('No batch team metrics data available')),
      });

      const res = await request(app).post('/batch-team-metrics').send(body);

      expect(res.status).toBe(404);
    });

    it("answers bad gateway with Sleuth's reason when every team fails", async () => {
      const app = await appWith({
        getBatchTeamMetrics: jest
          .fn()
          .mockRejectedValue(
            new DoraMetricsError('Failed to query Sleuth API for batch team metrics: Team with slug frontend not found', 'PROVIDER_ERROR'),
          ),
      });

      const res = await request(app).post('/batch-team-metrics').send(body);

      expect(res.status).toBe(502);
      expect(res.body.error).toContain('Team with slug frontend not found');
    });
  });
});
