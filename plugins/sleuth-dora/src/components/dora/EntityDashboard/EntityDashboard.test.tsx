import { screen } from '@testing-library/react';
import { mockApis, renderInTestApp, TestApiProvider } from '@backstage/test-utils';
import { configApiRef } from '@backstage/core-plugin-api';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { EntityDashboard } from './EntityDashboard';
import { doraBackendApiRef } from '../../../api/DORABackendClient';

const range = (numOfDeploys: number, leadTime: number, failureRate: number, mttr: number) => ({
  numOfDeploys,
  numOfDeploysPerDay: Math.round((numOfDeploys / 28) * 100) / 100,
  avgLeadTimeInSec: leadTime,
  failureRatePercent: failureRate,
  avgMttrDurationInSec: mttr,
});

// payments-service in Sleuth, 15 Sep to 12 Oct 2026 against the 28 days before
const paymentsService = {
  project: { currentRange: range(15, 10184, 13.33, 5854), previousRange: range(10, 9840, 10, 6694) },
};

const component = (name: string, annotations?: Record<string, string>) => ({
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: { name, annotations },
  spec: { type: 'service' },
});

const mapped = component('payments', {
  'sleuth.io/project-slug': 'my-project',
  'sleuth.io/code-deployment-slug': 'payments-service',
});

const renderDashboard = (entity: ReturnType<typeof component>, api: Record<string, jest.Mock>) =>
  renderInTestApp(
    <TestApiProvider
      apis={[
        [doraBackendApiRef, api as any],
        [
          configApiRef,
          mockApis.config({ data: { dora: { sleuth: { environment: 'production', defaultProjectSlug: 'default-project' } } } }),
        ],
      ]}
    >
      <EntityProvider entity={entity}>
        <EntityDashboard />
      </EntityProvider>
    </TestApiProvider>,
  );

const apiReturning = (metrics: unknown, insights: unknown[] = []) => ({
  getProjectDORAMetrics: jest.fn().mockResolvedValue(metrics),
  getProjectDORAMetricsInsights: jest.fn().mockResolvedValue({ project: { insights } }),
});

describe('EntityDashboard', () => {
  it('asks for the project and code deployment named in the annotations', async () => {
    const api = apiReturning(paymentsService);

    await renderDashboard(mapped, api);
    await screen.findByText('0.54/day');

    expect(api.getProjectDORAMetrics).toHaveBeenCalledWith('my-project', 'production', 'payments-service', 'last28days');
    expect(api.getProjectDORAMetricsInsights).toHaveBeenCalledWith('my-project', 'production', 'payments-service', 'last28days');
    expect(screen.queryByText(/has no Sleuth annotations/)).not.toBeInTheDocument();
  });

  it('shows each metric with its change against the previous period', async () => {
    await renderDashboard(mapped, apiReturning(paymentsService));

    expect(await screen.findByText('0.54/day')).toBeInTheDocument();
    expect(screen.getByText('2h 49m')).toBeInTheDocument();
    expect(screen.getByText('13.3%')).toBeInTheDocument();
    expect(screen.getByText('1h 37m')).toBeInTheDocument();
    // each change appears on the card and in the table: 15 against 10 deploys, then lead time (3.496%),
    // failure rate and MTTR
    for (const change of ['50%', '3%', '33%', '13%']) {
      expect(screen.getAllByText(change)).toHaveLength(2);
    }
    expect(screen.getAllByText('vs previous period')).toHaveLength(4);
    expect(screen.getByText('whole project')).toBeInTheDocument();
  });

  it('falls back to the default project and the component name, and says so', async () => {
    const api = apiReturning(paymentsService);

    await renderDashboard(component('checkout'), api);
    await screen.findByText('0.54/day');

    expect(api.getProjectDORAMetrics).toHaveBeenCalledWith('default-project', 'production', 'checkout', 'last28days');
    expect(screen.getByText(/has no Sleuth annotations/)).toBeInTheDocument();
  });

  it('says there were no deployments instead of rating zeros as elite', async () => {
    const idle = { project: { currentRange: range(0, 0, 0, 4840), previousRange: range(14, 4192194, 14.29, 4840) } };

    await renderDashboard(mapped, apiReturning(idle));

    expect(
      await screen.findByText('No deployments recorded in Sleuth for "payments-service" in this period.'),
    ).toBeInTheDocument();
    expect(screen.queryByText('DORA Metrics Overview')).not.toBeInTheDocument();
  });

  it('makes no comparison for lead time and failure rate when the previous period had no deployments', async () => {
    const firstDeploys = { project: { currentRange: range(2, 17031829, 0, 5854), previousRange: range(0, 0, 0, 6694) } };

    await renderDashboard(mapped, apiReturning(firstDeploys));

    expect(await screen.findByText('197d 3h')).toBeInTheDocument();
    // lead time and failure rate, each on the card and in the table
    expect(screen.getAllByText('n/a')).toHaveLength(4);
    // frequency did start from nothing
    expect(screen.getAllByText('new')).toHaveLength(2);
    // only frequency and MTTR still have a previous period to compare with
    expect(screen.getAllByText('vs previous period')).toHaveLength(1);
  });

  it("shows Sleuth's lead time insight on the lead time card", async () => {
    const insights = [
      { __typename: 'TeamMetricLowInsightType' },
      {
        __typename: 'MetricOffsetFromAverageInsightType',
        insightMetricType: 'LEAD_TIME',
        message: 'Your lead time is higher than your previous period by 40%.',
        icon: 'lightbulb-exclamation',
        isPositive: false,
      },
      {
        __typename: 'MetricOffsetFromAverageInsightType',
        insightMetricType: 'DEPLOYING',
        message: 'Your deploying time is higher than your previous period by 51%.',
        icon: 'lightbulb-exclamation',
        isPositive: false,
      },
    ];

    await renderDashboard(mapped, apiReturning(paymentsService, insights));

    expect(await screen.findByText('Your lead time is higher than your previous period by 40%.')).toBeInTheDocument();
    // deploying time is not deployment frequency and has no card of its own
    expect(screen.queryByText(/deploying time/)).not.toBeInTheDocument();
  });

  it('explains an unknown code deployment', async () => {
    const message =
      'Sleuth has no code deployment "payments-service" in project "my-project". Check the sleuth.io/code-deployment-slug annotation on this component.';
    const api = {
      getProjectDORAMetrics: jest.fn().mockRejectedValue(new Error(message)),
      getProjectDORAMetricsInsights: jest.fn().mockRejectedValue(new Error(message)),
    };

    await renderDashboard(mapped, api);

    expect(await screen.findByText(message)).toBeInTheDocument();
    expect(screen.queryByText('DORA Metrics Overview')).not.toBeInTheDocument();
  });

  it('still shows the metrics when only the insights fail', async () => {
    const api = {
      getProjectDORAMetrics: jest.fn().mockResolvedValue(paymentsService),
      getProjectDORAMetricsInsights: jest.fn().mockRejectedValue(new Error('insights are down')),
    };

    await renderDashboard(mapped, api);

    expect(await screen.findByText('0.54/day')).toBeInTheDocument();
    expect(screen.queryByText('insights are down')).not.toBeInTheDocument();
  });

  it('keeps the metrics error when the insights request succeeds after it', async () => {
    let failMetrics: (error: Error) => void = () => {};
    const api = {
      getProjectDORAMetrics: jest.fn().mockReturnValue(new Promise((_resolve, reject) => { failMetrics = reject; })),
      getProjectDORAMetricsInsights: jest.fn().mockResolvedValue({ project: { insights: [] } }),
    };

    await renderDashboard(mapped, api);
    failMetrics(new Error('Failed to query Sleuth API: PERMISSION_DENIED'));

    expect(await screen.findByText('Failed to query Sleuth API: PERMISSION_DENIED')).toBeInTheDocument();
  });
});
