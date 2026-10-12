import { screen } from '@testing-library/react';
import { renderInTestApp } from '@backstage/test-utils';
import { ExecutiveSummary } from './ExecutiveSummary';

// Organisation figures from Sleuth for 15 Sep to 12 Oct 2026 and the 28 days before
const totalRecap = {
  numOfDeploys: 65,
  numOfDeploysPerDay: 2.32,
  avgLeadTimeInSec: 1885879,
  failureRatePercent: 10.77,
  avgMttrDurationInSec: 5854,
};
const previousRecap = {
  numOfDeploys: 80,
  numOfDeploysPerDay: 2.86,
  avgLeadTimeInSec: 540435,
  failureRatePercent: 10,
  avgMttrDurationInSec: 6694,
};
const quarter = (startIncl: string, numOfDeploysPerDay: number) => ({
  startIncl,
  endNotIncl: startIncl,
  numOfDeploysPerDay,
  avgLeadTimeInSec: 1496029,
  failureRatePercent: 8,
  avgMttrDurationInSec: 4380,
});
const quarters = [
  quarter('2026-09-15T00:00:00Z', 3.57),
  quarter('2026-09-22T00:00:00Z', 2.57),
  quarter('2026-09-29T00:00:00Z', 3.14),
  quarter('2026-10-06T00:00:00Z', 0),
];

describe('ExecutiveSummary', () => {
  it('shows the totals in the units Sleuth uses', async () => {
    await renderInTestApp(<ExecutiveSummary metricsData={{ totalRecap, quarters }} previousRecap={previousRecap} />);

    expect(screen.getByText('2.32/day')).toBeInTheDocument();
    expect(screen.getByText('21d 19h')).toBeInTheDocument();
    expect(screen.getByText('10.8%')).toBeInTheDocument();
    expect(screen.getByText('1h 37m')).toBeInTheDocument();
  });

  it('compares each metric with the previous period, not one half of the range with the other', async () => {
    await renderInTestApp(<ExecutiveSummary metricsData={{ totalRecap, quarters }} previousRecap={previousRecap} />);

    // half against half gave 49%, 10%, 29% and 63% for the same data
    expect(screen.getByText('19%')).toBeInTheDocument();
    expect(screen.getByText('249%')).toBeInTheDocument();
    expect(screen.getByText('8%')).toBeInTheDocument();
    expect(screen.getByText('13%')).toBeInTheDocument();
    expect(screen.getAllByText('vs previous period')).toHaveLength(4);
  });

  it('makes no comparison when the backend sends no previous period', async () => {
    await renderInTestApp(<ExecutiveSummary metricsData={{ totalRecap, quarters }} />);

    expect(screen.getAllByText('n/a')).toHaveLength(4);
    expect(screen.queryByText('vs previous period')).not.toBeInTheDocument();
  });

  it('does not compare lead time or failure rate with a period that had no deployments', async () => {
    const empty = { numOfDeploys: 0, numOfDeploysPerDay: 0, avgLeadTimeInSec: 0, failureRatePercent: 0, avgMttrDurationInSec: 0 };

    await renderInTestApp(<ExecutiveSummary metricsData={{ totalRecap, quarters }} previousRecap={empty} />);

    expect(screen.getByText('new')).toBeInTheDocument();
    expect(screen.getAllByText('n/a')).toHaveLength(2);
    expect(screen.getByText('from 0m')).toBeInTheDocument();
  });

  it('says there were no deployments instead of showing zeros', async () => {
    const empty = { numOfDeploys: 0, numOfDeploysPerDay: 0, avgLeadTimeInSec: 0, failureRatePercent: 0, avgMttrDurationInSec: 0 };

    await renderInTestApp(<ExecutiveSummary metricsData={{ totalRecap: empty, quarters }} previousRecap={previousRecap} />);

    expect(screen.getByText('No deployments recorded in Sleuth in this period.')).toBeInTheDocument();
    expect(screen.queryByText('0.00/day')).not.toBeInTheDocument();
    expect(screen.queryByText('0.0%')).not.toBeInTheDocument();
  });

  it('says so when there is no data at all', async () => {
    await renderInTestApp(<ExecutiveSummary />);

    expect(screen.getByText('No metrics data available')).toBeInTheDocument();
  });
});
