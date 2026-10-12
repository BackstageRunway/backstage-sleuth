import { screen } from '@testing-library/react';
import { mockApis, renderInTestApp, TestApiProvider } from '@backstage/test-utils';
import { configApiRef, discoveryApiRef, identityApiRef } from '@backstage/core-plugin-api';
import { Route, Routes } from 'react-router-dom';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { doraLegacyPlugin, DoraELTPage, DoraPerformanceComponent } from './legacy';
import { doraBackendApiRef, DORABackendClientImpl } from './api/DORABackendClient';

const recap = (numOfDeploys: number) => ({
  numOfDeploys,
  numOfDeploysPerDay: Math.round((numOfDeploys / 28) * 100) / 100,
  avgLeadTimeInSec: 7200,
  failureRatePercent: 10,
  avgMttrDurationInSec: 3600,
});

const api = {
  getOrganizationTrendMetrics: jest.fn().mockResolvedValue({
    organization: { previousRecap: recap(80), metricsRecapWithQuarters: { totalRecap: recap(65), quarters: [] } },
  }),
  getProjectDORAMetrics: jest.fn().mockResolvedValue({ project: { currentRange: recap(15), previousRange: recap(10) } }),
  getProjectDORAMetricsInsights: jest.fn().mockResolvedValue({ project: { insights: [] } }),
};

const apis = [
  [doraBackendApiRef, api],
  [configApiRef, mockApis.config({ data: { dora: { sleuth: { environment: 'production' } } } })],
] as const;

// What an app on the legacy frontend system imports
describe('legacy plugin', () => {
  it('registers an API client built from the config, identity and discovery APIs', () => {
    const factory = [...doraLegacyPlugin.getApis()].find(f => f.api.id === doraBackendApiRef.id)!;

    expect(Object.values(factory.deps).map((ref: any) => ref.id).sort()).toEqual(
      [configApiRef.id, discoveryApiRef.id, identityApiRef.id].sort(),
    );
    const client = factory.factory({
      configApi: mockApis.config(),
      identityApi: mockApis.identity(),
      discoveryApi: mockApis.discovery(),
    } as any);
    expect(client).toBeInstanceOf(DORABackendClientImpl);
  });

  it('loads the executive dashboard through the DoraELTPage extension', async () => {
    await renderInTestApp(
      <TestApiProvider apis={apis as any}>
        <Routes>
          <Route path="/dora-elt" element={<DoraELTPage />} />
        </Routes>
      </TestApiProvider>,
      { routeEntries: ['/dora-elt'] },
    );

    expect(await screen.findByText('Executive Dashboard')).toBeInTheDocument();
    expect(await screen.findByText('2.32/day')).toBeInTheDocument();
  });

  it('loads the component dashboard through the DoraPerformanceComponent extension', async () => {
    const entity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: { name: 'payments', annotations: { 'sleuth.io/code-deployment-slug': 'payments-service' } },
      spec: { type: 'service' },
    };

    await renderInTestApp(
      <TestApiProvider apis={apis as any}>
        <EntityProvider entity={entity}>
          <DoraPerformanceComponent />
        </EntityProvider>
      </TestApiProvider>,
    );

    expect(await screen.findByText('DORA Metrics Overview')).toBeInTheDocument();
    expect(await screen.findByText('0.54/day')).toBeInTheDocument();
  });
});
