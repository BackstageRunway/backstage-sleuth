import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderInTestApp, TestApiProvider } from '@backstage/test-utils';
import { ExecutiveDashboard } from './ExecutiveDashboard';
import { doraBackendApiRef } from '../../../api/DORABackendClient';

const recap = (numOfDeploys: number, leadTime: number) => ({
  numOfDeploys,
  numOfDeploysPerDay: Math.round((numOfDeploys / 28) * 100) / 100,
  avgLeadTimeInSec: leadTime,
  failureRatePercent: 10,
  avgMttrDurationInSec: 3600,
});

const organization = {
  previousRecap: recap(80, 540435),
  metricsRecapWithQuarters: {
    totalRecap: recap(65, 1885879),
    quarters: [
      { startIncl: '2026-09-15T00:00:00Z', endNotIncl: '2026-09-29T00:00:00Z', numOfDeploysPerDay: 3, avgLeadTimeInSec: 7200, failureRatePercent: 10, avgMttrDurationInSec: 3600 },
      { startIncl: '2026-09-29T00:00:00Z', endNotIncl: '2026-10-13T00:00:00Z', numOfDeploysPerDay: 0, avgLeadTimeInSec: 0, failureRatePercent: 0, avgMttrDurationInSec: 0 },
    ],
  },
};

const renderDashboard = (getOrganizationTrendMetrics: jest.Mock) =>
  renderInTestApp(
    <TestApiProvider apis={[[doraBackendApiRef, { getOrganizationTrendMetrics } as any]]}>
      <ExecutiveDashboard />
    </TestApiProvider>,
  );

describe('ExecutiveDashboard', () => {
  it('loads the last 28 days first and shows the trend against the previous period', async () => {
    const api = jest.fn().mockResolvedValue({ organization });

    await renderDashboard(api);

    expect(await screen.findByText('2.32/day')).toBeInTheDocument();
    expect(api).toHaveBeenCalledWith('last28days');
    expect(screen.getByText('19%')).toBeInTheDocument();
    expect(screen.getByText('249%')).toBeInTheDocument();
  });

  it('shows a dash, not a zero, for a slice of the range without deployments', async () => {
    await renderDashboard(jest.fn().mockResolvedValue({ organization }));

    await screen.findByText('2.32/day');
    // lead time, failure rate and MTTR of the empty second slice
    expect(screen.getAllByText('–')).toHaveLength(3);
    expect(screen.getByText('0.00')).toBeInTheDocument();
  });

  it('fetches again when another time range is picked', async () => {
    const api = jest.fn().mockResolvedValue({ organization });
    await renderDashboard(api);
    await screen.findByText('2.32/day');

    await userEvent.click(screen.getByText('Last 90 Days'));

    expect(api).toHaveBeenLastCalledWith('last90days');
  });

  it("shows Sleuth's reason when the request fails", async () => {
    await renderDashboard(jest.fn().mockRejectedValue(new Error('Failed to query Sleuth API: PERMISSION_DENIED')));

    expect(await screen.findAllByText(/PERMISSION_DENIED/)).not.toHaveLength(0);
  });
});
