import { screen } from '@testing-library/react';
import { renderInTestApp } from '@backstage/test-utils';
import { ProjectHealth } from './ProjectHealth';

const slice = (startIncl: string, perDay: number, leadTime: number, failureRate: number, mttr: number) => ({
  startIncl,
  endNotIncl: startIncl,
  numOfDeploysPerDay: perDay,
  avgLeadTimeInSec: leadTime,
  failureRatePercent: failureRate,
  avgMttrDurationInSec: mttr,
});

const dataWith = (quarters: ReturnType<typeof slice>[]) => ({
  organization: { metricsRecapWithQuarters: { quarters } },
});

const units = () => screen.getAllByText(/^Unit:/).map(node => node.textContent);

describe('ProjectHealth', () => {
  it('shows each slice of the range with the value Sleuth returned for it', async () => {
    await renderInTestApp(
      <ProjectHealth
        loading={false}
        error={null}
        data={dataWith([
          slice('2026-09-15T00:00:00Z', 3.57, 1496029, 8, 4380),
          slice('2026-09-22T00:00:00Z', 2.57, 1468050, 11.11, 8850),
        ])}
      />,
    );

    for (const value of ['3.57', '2.57', '17d 7h', '16d 23h', '8.0', '11.1', '1h 13m', '2h 27m']) {
      expect(screen.getByText(value)).toBeInTheDocument();
    }
    // each slice is labelled by the day it starts, once under every one of the four charts
    expect(screen.getAllByText(/15/).length).toBeGreaterThanOrEqual(4);
    expect(screen.getAllByText(/22/).length).toBeGreaterThanOrEqual(4);
  });

  it.each([
    ['days once a value reaches two days', 3 * 86400, 'd'],
    ['hours from one hour up to two days', 36 * 3600, 'h'],
    ['minutes under an hour', 1800, 'm'],
  ])('plots durations in %s', async (_case, seconds, unit) => {
    await renderInTestApp(
      <ProjectHealth loading={false} error={null} data={dataWith([slice('2026-09-15T00:00:00Z', 1, seconds, 5, seconds)])} />,
    );

    expect(units()).toEqual(['Unit: /day', `Unit: ${unit}`, 'Unit: %', `Unit: ${unit}`]);
  });

  it('picks the unit for lead time and MTTR separately', async () => {
    await renderInTestApp(
      <ProjectHealth loading={false} error={null} data={dataWith([slice('2026-09-15T00:00:00Z', 1, 20 * 86400, 5, 5400)])} />,
    );

    expect(units()).toEqual(['Unit: /day', 'Unit: d', 'Unit: %', 'Unit: h']);
  });

  it('scales by the largest slice, so a short one does not shrink the axis', async () => {
    await renderInTestApp(
      <ProjectHealth
        loading={false}
        error={null}
        data={dataWith([slice('2026-09-15T00:00:00Z', 1, 600, 5, 600), slice('2026-09-22T00:00:00Z', 1, 5 * 86400, 5, 600)])}
      />,
    );

    expect(units()[1]).toBe('Unit: d');
    expect(screen.getAllByText('10m').length).toBeGreaterThan(0);
  });

  it('says so when there is no trend data', async () => {
    await renderInTestApp(<ProjectHealth loading={false} error={null} data={dataWith([])} />);

    expect(screen.getByText('No trend data available')).toBeInTheDocument();
  });

  it('shows the reason when loading failed', async () => {
    await renderInTestApp(<ProjectHealth loading={false} error="PERMISSION_DENIED" data={null} />);

    expect(screen.getByText('Failed to load organization metrics: PERMISSION_DENIED')).toBeInTheDocument();
  });

  it('shows a spinner while loading', async () => {
    await renderInTestApp(<ProjectHealth loading error={null} data={null} />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});
