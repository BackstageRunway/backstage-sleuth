import { mockServices } from '@backstage/backend-test-utils';
import { MetricsService } from './MetricsService';
import { SleuthClient } from '../../infrastructure/sleuth/SleuthClient';

const recap = {
  avgLeadTimeInSec: 100,
  numOfDeploys: 1,
  numOfDeploysPerDay: 1,
  failureRatePercent: 0,
  avgMttrDurationInSec: 0,
};

const setup = () => {
  const client = {
    projectMetrics: jest.fn().mockResolvedValue({ project: { currentRange: recap, previousRange: recap } }),
    projectMetricsInsights: jest.fn().mockResolvedValue({ project: { insights: [] } }),
    getTrendMetrics: jest.fn().mockResolvedValue({ organization: {} }),
    batchTeamMetrics: jest.fn().mockResolvedValue({ teams: [{ name: 'admins' }] }),
  };
  const service = new MetricsService(client as unknown as SleuthClient, mockServices.logger.mock());
  return { client, service };
};

// The windows a request for the given range produced
const windowsFor = async (now: string, timeRange: string) => {
  jest.setSystemTime(new Date(now));
  const { client, service } = setup();
  await service.getProjectMetrics('my-project', 'production', 'my-deployment', timeRange);
  const { currentRangeStart, currentRangeEnd, previousRangeStart, previousRangeEnd } =
    client.projectMetrics.mock.calls[0][0];
  return { currentRangeStart, currentRangeEnd, previousRangeStart, previousRangeEnd };
};

describe('MetricsService', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('date windows', () => {
    it('ends the current period at the close of today in UTC and counts today as a day', async () => {
      expect(await windowsFor('2026-10-12T09:30:00Z', 'last7days')).toEqual({
        currentRangeStart: '2026-10-06T00:00:00.000Z',
        currentRangeEnd: '2026-10-13T00:00:00.000Z',
        previousRangeStart: '2026-09-29T00:00:00.000Z',
        previousRangeEnd: '2026-10-06T00:00:00.000Z',
      });
    });

    it.each([
      ['last7days', 7],
      ['last14days', 14],
      ['last28days', 28],
      ['last90days', 90],
    ])('makes both periods of %s exactly that long and back to back', async (timeRange, days) => {
      const w = await windowsFor('2026-10-12T09:30:00Z', timeRange);
      const dayMs = 24 * 60 * 60 * 1000;

      expect(Date.parse(w.currentRangeEnd) - Date.parse(w.currentRangeStart)).toBe(days * dayMs);
      expect(Date.parse(w.previousRangeEnd) - Date.parse(w.previousRangeStart)).toBe(days * dayMs);
      expect(w.previousRangeEnd).toBe(w.currentRangeStart);
    });

    it('keeps the same window from the first to the last second of a UTC day', async () => {
      const early = await windowsFor('2026-10-12T00:00:00Z', 'last28days');
      const late = await windowsFor('2026-10-12T23:59:59Z', 'last28days');

      expect(late).toEqual(early);
      expect(early.currentRangeEnd).toBe('2026-10-13T00:00:00.000Z');
    });

    it('moves the window on at midnight UTC', async () => {
      const w = await windowsFor('2026-10-13T00:00:01Z', 'last28days');

      expect(w.currentRangeEnd).toBe('2026-10-14T00:00:00.000Z');
    });

    it('crosses month and year boundaries', async () => {
      expect(await windowsFor('2027-01-01T12:00:00Z', 'last28days')).toEqual({
        currentRangeStart: '2026-12-05T00:00:00.000Z',
        currentRangeEnd: '2027-01-02T00:00:00.000Z',
        previousRangeStart: '2026-11-07T00:00:00.000Z',
        previousRangeEnd: '2026-12-05T00:00:00.000Z',
      });
    });

    it('handles the end of February in a leap year', async () => {
      const w = await windowsFor('2028-02-29T12:00:00Z', 'last7days');

      expect(w.currentRangeStart).toBe('2028-02-23T00:00:00.000Z');
      expect(w.currentRangeEnd).toBe('2028-03-01T00:00:00.000Z');
    });

    it('rejects a time range it cannot read', async () => {
      const { client, service } = setup();

      await expect(service.getProjectMetrics('my-project', 'production', '', 'yesterday')).rejects.toThrow(
        'Invalid date range format',
      );
      expect(client.projectMetrics).not.toHaveBeenCalled();
    });
  });

  describe('what is asked of Sleuth', () => {
    beforeEach(() => {
      jest.setSystemTime(new Date('2026-10-12T09:30:00Z'));
    });

    it('passes the project, environment and code deployment through for metrics and insights', async () => {
      const { client, service } = setup();

      await service.getProjectMetrics('my-project', 'production', 'my-deployment', 'last28days');
      await service.getProjectMetricsInsights('my-project', 'production', 'my-deployment', 'last28days');

      for (const call of [client.projectMetrics, client.projectMetricsInsights]) {
        expect(call).toHaveBeenCalledWith(
          expect.objectContaining({
            projectSlug: 'my-project',
            environment: 'production',
            deploymentSlug: 'my-deployment',
            currentRangeStart: '2026-09-15T00:00:00.000Z',
            currentRangeEnd: '2026-10-13T00:00:00.000Z',
          }),
        );
      }
    });

    it('asks for the organisation trend together with the period before it', async () => {
      const { client, service } = setup();

      await service.getOrganizationTrendMetrics('last28days');

      expect(client.getTrendMetrics).toHaveBeenCalledWith(
        '2026-09-15T00:00:00.000Z',
        '2026-10-13T00:00:00.000Z',
        '2026-08-18T00:00:00.000Z',
        '2026-09-15T00:00:00.000Z',
      );
    });

    it('asks for every team with the same windows and environment', async () => {
      const { client, service } = setup();

      await service.getBatchTeamMetrics(['admins', 'developers'], 'production', '', 'last14days');

      expect(client.batchTeamMetrics).toHaveBeenCalledWith(
        ['admins', 'developers'].map(teamSlug => ({
          teamSlug,
          environment: 'production',
          currentRangeStart: '2026-09-29T00:00:00.000Z',
          currentRangeEnd: '2026-10-13T00:00:00.000Z',
          previousRangeStart: '2026-09-15T00:00:00.000Z',
          previousRangeEnd: '2026-09-29T00:00:00.000Z',
        })),
      );
    });
  });

  describe('missing data', () => {
    it('fails when Sleuth returns no ranges for a project', async () => {
      const { client, service } = setup();
      client.projectMetrics.mockResolvedValue({ project: null });

      await expect(service.getProjectMetrics('my-project', 'production', '', 'last7days')).rejects.toThrow(
        'No metrics data available',
      );
    });

    it('fails when Sleuth knows none of the teams', async () => {
      const { client, service } = setup();
      client.batchTeamMetrics.mockResolvedValue({ teams: [] });

      await expect(service.getBatchTeamMetrics(['nobody'], 'production', '', 'last7days')).rejects.toThrow(
        'No batch team metrics data available',
      );
    });

    it('passes a Sleuth failure on unchanged', async () => {
      const { client, service } = setup();
      const failure = new Error('PERMISSION_DENIED');
      client.getTrendMetrics.mockRejectedValue(failure);

      await expect(service.getOrganizationTrendMetrics('last7days')).rejects.toBe(failure);
    });
  });
});
