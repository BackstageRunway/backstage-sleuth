import { screen, waitFor } from '@testing-library/react';
import { renderInTestApp } from '@backstage/test-utils';
import { TeamPerformance } from './TeamPerformance';
import { TeamMetricsData } from '../hooks/useAllTeamsMetrics';

const team = (name: string, overrides: Partial<TeamMetricsData> = {}): TeamMetricsData => ({
  name,
  metrics: { deploymentFrequency: '0.54/day', leadTime: '2h 49m', failureRate: '13.3%', mttr: '1h 42m' },
  raw: { leadTimeSec: 10184, mttrSec: 6150 },
  trend: 'stable',
  hasDeployments: true,
  loading: false,
  ...overrides,
});

const idle = (name: string) =>
  team(name, {
    metrics: { deploymentFrequency: '0.00/day', leadTime: '0m', failureRate: '0.0%', mttr: '0m' },
    raw: { leadTimeSec: 0, mttrSec: 0 },
    hasDeployments: false,
  });

// The numbers count up for 800ms before they settle
const settled = { timeout: 3000 };

describe('TeamPerformance', () => {
  it('shows the frequency with both decimals, as the chart and the other views do', async () => {
    await renderInTestApp(<TeamPerformance allTeamsData={[team('admins')]} />);

    // once on the card, once in the middle of the chart
    await waitFor(() => expect(screen.getAllByText('0.54/day')).toHaveLength(2), settled);
    expect(screen.queryByText('0.5/day')).not.toBeInTheDocument();
  });

  it('shows lead time, failure rate and MTTR for a team that deployed', async () => {
    await renderInTestApp(<TeamPerformance allTeamsData={[team('admins')]} />);

    expect(await screen.findByText('13.3%', {}, settled)).toBeInTheDocument();
    expect(screen.getAllByText('2h 49m')).not.toHaveLength(0);
    expect(screen.getAllByText('1h 42m')).not.toHaveLength(0);
    expect(screen.getByText('Stable')).toBeInTheDocument();
  });

  it('marks a team without deployments instead of calling it stable with perfect numbers', async () => {
    await renderInTestApp(<TeamPerformance allTeamsData={[idle('admins')]} />);

    expect(await screen.findByText('No deployments')).toBeInTheDocument();
    expect(screen.queryByText('Stable')).not.toBeInTheDocument();
    // lead time, failure rate and MTTR
    expect(screen.getAllByText('–')).toHaveLength(3);
    expect(screen.getByText('No deployments recorded in Sleuth for this team in this period.')).toBeInTheDocument();
    expect(screen.queryByText('Avg Lead Time')).not.toBeInTheDocument();
  });

  it('leaves teams without deployments out of the average lead time', async () => {
    const active = team('admins', {
      metrics: { deploymentFrequency: '1.00/day', leadTime: '2h', failureRate: '10.0%', mttr: '1h' },
      raw: { leadTimeSec: 7200, mttrSec: 3600 },
    });

    await renderInTestApp(<TeamPerformance allTeamsData={[active, idle('developers')]} />);

    // counting the idle team would halve the average to 1h
    expect(await screen.findAllByText('2h')).toHaveLength(2);
    expect(screen.getByText('Avg Lead Time')).toBeInTheDocument();
    // the idle team does count towards deployments: (1.00 + 0.00) / 2
    expect(screen.getByText('0.50/day')).toBeInTheDocument();
  });

  it('puts a declining team first and asks for action', async () => {
    await renderInTestApp(
      <TeamPerformance allTeamsData={[team('admins'), team('developers', { trend: 'down' })]} />,
    );

    expect(await screen.findByText('Take Action')).toBeInTheDocument();
    expect(screen.getByText('Declining')).toBeInTheDocument();
    const names = screen.getAllByText(/^(admins|developers)$/).map(node => node.textContent);
    expect(names[0]).toBe('developers');
  });

  it('shows only the selected team', async () => {
    await renderInTestApp(
      <TeamPerformance selectedTeam="developers" allTeamsData={[team('admins'), team('developers')]} />,
    );

    expect(await screen.findAllByText('developers')).not.toHaveLength(0);
    expect(screen.queryByText('admins')).not.toBeInTheDocument();
  });

  it('says so when the selected team has no data', async () => {
    await renderInTestApp(<TeamPerformance selectedTeam="frontend" allTeamsData={[team('admins')]} />);

    expect(screen.getByText('No data available for team "frontend"')).toBeInTheDocument();
  });
});
