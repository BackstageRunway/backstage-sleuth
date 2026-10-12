import { mockApis } from '@backstage/test-utils';
import { DORABackendClientImpl } from './DORABackendClient';

const BACKEND = 'http://localhost:7007/api/sleuth-dora-backend';

const answer = (body: unknown, status = 200) =>
  ({ ok: status < 400, status, json: async () => body }) as Response;

const newClient = (token: string | undefined = 'user-token') =>
  new DORABackendClientImpl({
    configApi: mockApis.config({ data: { backend: { baseUrl: 'http://localhost:7007' } } }),
    identityApi: { getCredentials: async () => ({ token }) } as any,
    discoveryApi: { getBaseUrl: jest.fn().mockResolvedValue(BACKEND) },
  });

describe('DORABackendClient', () => {
  let fetchMock: jest.SpyInstance;

  beforeEach(() => {
    fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue(answer({ ok: true }));
  });

  afterEach(() => {
    fetchMock.mockRestore();
  });

  const requested = () => {
    const [url, init] = fetchMock.mock.calls[0];
    return { url: new URL(url), init };
  };

  describe('where each request goes', () => {
    it('asks for project metrics by project, environment, code deployment and range', async () => {
      await newClient().getProjectDORAMetrics('my-project', 'production', 'payments-service', 'last28days');

      const { url } = requested();
      expect(`${url.origin}${url.pathname}`).toBe(`${BACKEND}/metrics/my-project`);
      expect(Object.fromEntries(url.searchParams)).toEqual({
        environment: 'production',
        deploymentId: 'payments-service',
        timeRange: 'last28days',
      });
    });

    it('asks for insights with the same parameters on its own path', async () => {
      await newClient().getProjectDORAMetricsInsights('my-project', 'production', 'payments-service', 'last28days');

      const { url } = requested();
      expect(url.pathname).toBe('/api/sleuth-dora-backend/metrics-insights/my-project');
      expect(Object.fromEntries(url.searchParams)).toEqual({
        environment: 'production',
        deploymentId: 'payments-service',
        timeRange: 'last28days',
      });
    });

    it('always sends the code deployment, empty for the whole project, because the backend requires it', async () => {
      await newClient().getProjectDORAMetrics('my-project', 'production', '', 'last7days');

      expect(requested().url.searchParams.get('deploymentId')).toBe('');
    });

    it('keeps a value with special characters intact instead of breaking the query', async () => {
      await newClient().getProjectDORAMetrics('team a/b', 'prod & eu', 'api#1', 'last7days');

      const { url } = requested();
      expect(url.pathname).toBe('/api/sleuth-dora-backend/metrics/team%20a%2Fb');
      expect(url.searchParams.get('environment')).toBe('prod & eu');
      expect(url.searchParams.get('deploymentId')).toBe('api#1');
      expect(url.searchParams.get('timeRange')).toBe('last7days');
    });

    it('asks for the organisation trend by range only', async () => {
      await newClient().getOrganizationTrendMetrics('last90days');

      const { url } = requested();
      expect(url.pathname).toBe('/api/sleuth-dora-backend/org-trend-metrics');
      expect(Object.fromEntries(url.searchParams)).toEqual({ timeRange: 'last90days' });
    });

    it('posts all teams in one request', async () => {
      await newClient().getBatchTeamDORAMetrics(['admins', 'developers'], 'production', '', 'last14days');

      const { url, init } = requested();
      expect(url.pathname).toBe('/api/sleuth-dora-backend/batch-team-metrics');
      expect(init.method).toBe('POST');
      expect(init.headers['Content-Type']).toBe('application/json');
      expect(JSON.parse(init.body)).toEqual({
        teamSlugs: ['admins', 'developers'],
        environment: 'production',
        deploymentId: '',
        timeRange: 'last14days',
      });
    });
  });

  describe('authentication', () => {
    it("sends the signed-in user's token", async () => {
      await newClient('user-token').getOrganizationTrendMetrics('last7days');

      expect(requested().init.headers.Authorization).toBe('Bearer user-token');
    });

    it('sends no authorization header when there is no token', async () => {
      await newClient('').getOrganizationTrendMetrics('last7days');

      expect(requested().init.headers.Authorization).toBeUndefined();
    });

    it('keeps the token on a POST alongside the content type', async () => {
      await newClient('user-token').getBatchTeamDORAMetrics(['admins'], 'production', '', 'last7days');

      expect(requested().init.headers).toEqual({
        'Content-Type': 'application/json',
        Authorization: 'Bearer user-token',
      });
    });
  });

  describe('answers', () => {
    it('returns the body of a successful answer', async () => {
      const metrics = { project: { currentRange: { numOfDeploys: 15 } } };
      fetchMock.mockResolvedValue(answer(metrics));

      await expect(newClient().getProjectDORAMetrics('p', 'production', '', 'last7days')).resolves.toEqual(metrics);
    });

    it("passes on the plugin backend's own error message", async () => {
      fetchMock.mockResolvedValue(
        answer({ error: 'Sleuth has no code deployment "dora" in project "my-project".' }, 404),
      );

      await expect(newClient().getProjectDORAMetrics('my-project', 'production', 'dora', 'last7days')).rejects.toThrow(
        'Sleuth has no code deployment "dora" in project "my-project".',
      );
    });

    it('reads the message out of an error Backstage itself raised, such as a missing sign-in', async () => {
      fetchMock.mockResolvedValue(
        answer({ error: { name: 'AuthenticationError', message: 'Missing credentials' } }, 401),
      );

      await expect(newClient().getOrganizationTrendMetrics('last7days')).rejects.toThrow('Missing credentials');
    });

    it('reports the status when the error answer is not JSON, as from a proxy', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 502,
        json: async () => {
          throw new SyntaxError('Unexpected token < in JSON at position 0');
        },
      } as unknown as Response);

      await expect(newClient().getOrganizationTrendMetrics('last7days')).rejects.toThrow(
        'Request failed with status 502',
      );
    });

    it('reports the status when the error answer carries no message', async () => {
      fetchMock.mockResolvedValue(answer({}, 500));

      await expect(newClient().getOrganizationTrendMetrics('last7days')).rejects.toThrow(
        'Request failed with status 500',
      );
    });
  });
});
