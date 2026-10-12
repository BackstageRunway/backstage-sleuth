import { screen } from '@testing-library/react';
import { renderTestApp } from '@backstage/frontend-test-utils';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { doraFrontendPlugin } from './plugin';

const recap = (numOfDeploys: number) => ({
  numOfDeploys,
  numOfDeploysPerDay: Math.round((numOfDeploys / 28) * 100) / 100,
  avgLeadTimeInSec: 7200,
  failureRatePercent: 10,
  avgMttrDurationInSec: 3600,
});

const organization = {
  previousRecap: recap(80),
  metricsRecapWithQuarters: { totalRecap: recap(65), quarters: [] },
};

const config = { backend: { baseUrl: 'http://localhost:7007' }, app: { baseUrl: 'http://localhost:3000' } };

// Mounts the plugin the way an app on the new frontend system does: nothing is mocked but the network,
// so a broken route, loader or API factory fails here before it reaches npm
describe('doraFrontendPlugin in an app', () => {
  let fetchMock: jest.SpyInstance;

  beforeEach(() => {
    fetchMock = jest.spyOn(global, 'fetch').mockImplementation(async input => {
      const url = String(input);
      const body = url.includes('/org-trend-metrics') ? { organization } : { teams: [] };
      return { ok: true, status: 200, json: async () => body } as Response;
    });
  });

  afterEach(() => {
    fetchMock.mockRestore();
  });

  const backendRequests = () =>
    fetchMock.mock.calls.map(([url]) => String(url)).filter(url => url.includes('sleuth-dora-backend'));

  it('serves the executive dashboard at /dora-elt through its own API client', async () => {
    renderTestApp({ features: [doraFrontendPlugin], initialRouteEntries: ['/dora-elt'], config });

    expect(await screen.findByText('Executive Dashboard', {}, { timeout: 10000 })).toBeInTheDocument();
    expect(await screen.findByText('2.32/day')).toBeInTheDocument();
    expect(backendRequests()).toContain(
      'http://localhost:7007/api/sleuth-dora-backend/org-trend-metrics?timeRange=last28days',
    );
  });

  it('serves the team dashboard at /dora-team', async () => {
    // the catalog belongs to another plugin; the signed-in user has no entry in this one
    const catalog = { getEntitiesByRefs: jest.fn().mockResolvedValue({ items: [] }) };

    renderTestApp({
      features: [doraFrontendPlugin],
      initialRouteEntries: ['/dora-team'],
      config,
      apis: [[catalogApiRef, catalog as any]],
    });

    expect(await screen.findByText('Team Performance', {}, { timeout: 10000 })).toBeInTheDocument();
    expect(await screen.findByText('Failed to load user teams: No user entity found')).toBeInTheDocument();
  });
});
