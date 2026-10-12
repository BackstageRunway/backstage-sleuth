import fetch from 'cross-fetch';
import { SleuthClient } from './SleuthClient';
import { DoraMetricsError } from '../../domain/models/DoraMetrics';

jest.mock('cross-fetch', () => {
  const actual = jest.requireActual('cross-fetch');
  return { __esModule: true, ...actual, default: jest.fn() };
});

const { Response } = jest.requireActual('cross-fetch');
const fetchMock = fetch as unknown as jest.Mock;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const recap = {
  __typename: 'RecapType',
  avgLeadTimeInSec: 100,
  numOfDeploys: 2,
  numOfDeploysPerDay: 0.07,
  failureRatePercent: 0,
  avgMttrDurationInSec: 0,
};

const projectData = { project: { __typename: 'ProjectType', currentRange: recap, previousRange: recap } };

const WINDOWS = {
  currentRangeStart: '2026-09-15T00:00:00.000Z',
  currentRangeEnd: '2026-10-13T00:00:00.000Z',
  previousRangeStart: '2026-08-18T00:00:00.000Z',
  previousRangeEnd: '2026-09-15T00:00:00.000Z',
};

const projectRequest = (deploymentSlug: string) => ({
  projectSlug: 'my-project',
  environment: 'production',
  deploymentSlug,
  metricTypes: ['metrics' as const],
  ...WINDOWS,
});

const newClient = (cacheTtlSeconds?: number) =>
  new SleuthClient('secret-key', 'https://sleuth.example', 'my-org', cacheTtlSeconds);

// The request bodies sent so far, flattened across batches
const sentOperations = () =>
  fetchMock.mock.calls.flatMap(([, init]) => {
    const body = JSON.parse(init.body);
    return Array.isArray(body) ? body : [body];
  });

describe('SleuthClient', () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  describe('projectMetrics', () => {
    it('sends the key, organisation, project, environment and both periods to the graphql endpoint', async () => {
      fetchMock.mockResolvedValue(json({ data: projectData }));

      await newClient().projectMetrics(projectRequest('my-deployment'));

      const [url, init] = fetchMock.mock.calls[0];
      expect(url).toBe('https://sleuth.example/graphql');
      // Apollo lower-cases header names
      expect(init.headers.authorization).toBe('apikey secret-key');
      expect(sentOperations()[0].variables).toEqual({
        orgSlug: 'my-org',
        projectSlug: 'my-project',
        environmentSlug: 'production',
        deploymentSlugs: ['my-deployment'],
        currentRangeStartDate: WINDOWS.currentRangeStart,
        currentRangeEndDate: WINDOWS.currentRangeEnd,
        previousRangeStartDate: WINDOWS.previousRangeStart,
        previousRangeEndDate: WINDOWS.previousRangeEnd,
      });
    });

    it.each(['', '   '])('asks for the whole project when the code deployment is "%s"', async deploymentSlug => {
      fetchMock.mockResolvedValue(json({ data: projectData }));

      await newClient().projectMetrics(projectRequest(deploymentSlug));

      expect(sentOperations()[0].variables.deploymentSlugs).toEqual([]);
    });

    it('returns the current and previous ranges as Sleuth sent them', async () => {
      fetchMock.mockResolvedValue(json({ data: projectData }));

      const result = await newClient().projectMetrics(projectRequest('my-deployment'));

      expect(result.project.currentRange.numOfDeploys).toBe(2);
      expect(result.project.previousRange.numOfDeploysPerDay).toBe(0.07);
    });

    it("surfaces Sleuth's own reason when a query is refused", async () => {
      fetchMock.mockResolvedValue(
        json({ data: null, errors: [{ message: "No deployments found for `['dora']` slugs" }] }),
      );

      const failure = await newClient()
        .projectMetrics(projectRequest('dora'))
        .catch(error => error);

      expect(failure).toBeInstanceOf(DoraMetricsError);
      expect(failure.code).toBe('PROVIDER_ERROR');
      expect(failure.message).toBe("Failed to query Sleuth API: No deployments found for `['dora']` slugs");
    });

    it('reports the HTTP status when Sleuth rejects the key', async () => {
      fetchMock.mockResolvedValue(json({ detail: 'Invalid token' }, 401));

      await expect(newClient().projectMetrics(projectRequest(''))).rejects.toThrow(/Failed to query Sleuth API: .*401/);
    });

    it('reports a network failure', async () => {
      fetchMock.mockRejectedValue(new Error('getaddrinfo ENOTFOUND sleuth.example'));

      await expect(newClient().projectMetrics(projectRequest(''))).rejects.toThrow('ENOTFOUND');
    });
  });

  describe('projectMetricsInsights', () => {
    it('asks for insights over the current period only', async () => {
      fetchMock.mockResolvedValue(json({ data: { project: { __typename: 'ProjectType', insights: [] } } }));

      await newClient().projectMetricsInsights(projectRequest('my-deployment'));

      expect(sentOperations()[0].variables).toEqual({
        orgSlug: 'my-org',
        projectSlug: 'my-project',
        environmentSlug: 'production',
        deploymentSlugs: ['my-deployment'],
        startDate: WINDOWS.currentRangeStart,
        endDate: WINDOWS.currentRangeEnd,
      });
    });
  });

  describe('getTrendMetrics', () => {
    const organization = {
      __typename: 'OrganizationType',
      previousRecap: recap,
      metricsRecapWithQuarters: { __typename: 'RecapWithQuartersType', totalRecap: recap, quarters: [] },
    };

    it('asks the batch endpoint for the selected period and the one before it in one query', async () => {
      fetchMock.mockResolvedValue(json([{ data: { organization } }]));

      const result = await newClient().getTrendMetrics(
        WINDOWS.currentRangeStart,
        WINDOWS.currentRangeEnd,
        WINDOWS.previousRangeStart,
        WINDOWS.previousRangeEnd,
      );

      expect(fetchMock.mock.calls[0][0]).toBe('https://sleuth.example/graphql-batch');
      const [operation] = sentOperations();
      expect(operation.variables).toEqual({
        orgSlug: 'my-org',
        start: WINDOWS.currentRangeStart,
        end: WINDOWS.currentRangeEnd,
        previousStart: WINDOWS.previousRangeStart,
        previousEnd: WINDOWS.previousRangeEnd,
      });
      expect(operation.query).toContain('previousRecap: metricsRecap');
      expect(operation.query).toContain('metricsRecapWithQuarters');
      expect(result.organization.previousRecap.numOfDeploys).toBe(2);
    });
  });

  describe('batchTeamMetrics', () => {
    const teamRequest = (teamSlug: string) => ({ teamSlug, environment: 'production', ...WINDOWS });
    const team = (name: string) => ({ __typename: 'TeamType', name, currentRange: recap, previousRange: recap });

    // Answers each operation in a batch by its team, the way Sleuth does
    const answerTeams = (answers: Record<string, unknown>) =>
      fetchMock.mockImplementation(async (_url, init) =>
        json(JSON.parse(init.body).map((operation: any) => answers[operation.variables.teamSlug])),
      );

    it('sends each team with the environment and both periods', async () => {
      answerTeams({ admins: { data: { team: team('admins') } }, developers: { data: { team: team('developers') } } });

      const result = await newClient().batchTeamMetrics([teamRequest('admins'), teamRequest('developers')]);

      expect(result.teams.map(t => t.name)).toEqual(['admins', 'developers']);
      expect(sentOperations().map(operation => operation.variables)).toEqual(
        ['admins', 'developers'].map(teamSlug => ({
          orgSlug: 'my-org',
          teamSlug,
          environment: 'production',
          currentRangeStart: WINDOWS.currentRangeStart,
          currentRangeEnd: WINDOWS.currentRangeEnd,
          previousRangeStart: WINDOWS.previousRangeStart,
          previousRangeEnd: WINDOWS.previousRangeEnd,
        })),
      );
    });

    it('keeps the teams Sleuth knows when another one fails', async () => {
      answerTeams({
        admins: { data: { team: team('admins') } },
        frontend: { data: null, errors: [{ message: 'Team with slug frontend not found' }] },
      });

      const result = await newClient().batchTeamMetrics([teamRequest('admins'), teamRequest('frontend')]);

      expect(result.teams.map(t => t.name)).toEqual(['admins']);
    });

    it('surfaces the reason when every team fails', async () => {
      answerTeams({
        frontend: { data: null, errors: [{ message: 'Team with slug frontend not found' }] },
        sre: { data: null, errors: [{ message: 'Team with slug sre not found' }] },
      });

      await expect(newClient().batchTeamMetrics([teamRequest('frontend'), teamRequest('sre')])).rejects.toThrow(
        'Failed to query Sleuth API for batch team metrics: Team with slug frontend not found',
      );
    });
  });

  describe('cache', () => {
    beforeEach(() => {
      fetchMock.mockImplementation(async () => json({ data: projectData }));
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('answers a repeated query from the cache within the TTL', async () => {
      const client = newClient(300);

      await client.projectMetrics(projectRequest('my-deployment'));
      await client.projectMetrics(projectRequest('my-deployment'));

      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('does not reuse the answer for a different code deployment', async () => {
      // Apollo warns that the second project answer replaces the first in its cache; that costs a refetch, not accuracy
      jest.spyOn(console, 'warn').mockImplementation(() => {});
      const client = newClient(300);

      await client.projectMetrics(projectRequest('my-deployment'));
      await client.projectMetrics(projectRequest('other-deployment'));

      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('asks Sleuth again once the TTL has passed, so new deployments show up', async () => {
      const start = Date.now();
      const now = jest.spyOn(Date, 'now').mockReturnValue(start);
      const client = newClient(300);

      await client.projectMetrics(projectRequest('my-deployment'));
      now.mockReturnValue(start + 301 * 1000);
      await client.projectMetrics(projectRequest('my-deployment'));

      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });
});
