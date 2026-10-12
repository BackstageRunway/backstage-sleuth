import { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { mockApis, TestApiProvider } from '@backstage/test-utils';
import { configApiRef } from '@backstage/core-plugin-api';
import { useAllTeamsMetrics } from './useAllTeamsMetrics';
import { doraBackendApiRef } from '../../../../api/DORABackendClient';

const range = (numOfDeploys: number, days: number, leadTime: number, failureRate: number, mttr: number) => ({
  numOfDeploys,
  numOfDeploysPerDay: Math.round((numOfDeploys / days) * 100) / 100,
  avgLeadTimeInSec: leadTime,
  failureRatePercent: failureRate,
  avgMttrDurationInSec: mttr,
});

const TEAMS = ['admins'];

const renderWith = (getBatchTeamDORAMetrics: jest.Mock, teams: string[] = TEAMS) => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <TestApiProvider
      apis={[
        [doraBackendApiRef, { getBatchTeamDORAMetrics } as any],
        [configApiRef, mockApis.config({ data: { dora: { sleuth: { environment: 'production' } } } })],
      ]}
    >
      {children}
    </TestApiProvider>
  );
  return renderHook(() => useAllTeamsMetrics(teams, 'last28days'), { wrapper });
};

// The one team the hook returns for the given answer from the backend
const teamFor = async (currentRange: object, previousRange: object) => {
  const getBatchTeamDORAMetrics = jest.fn().mockResolvedValue({ teams: [{ name: 'admins', currentRange, previousRange }] });
  const { result } = renderWith(getBatchTeamDORAMetrics);
  await waitFor(() => expect(result.current.loading).toBe(false));
  return result.current.teams[0];
};

describe('useAllTeamsMetrics', () => {
  it('asks for all teams in one request with the configured environment', async () => {
    const api = jest.fn().mockResolvedValue({ teams: [] });
    const teams = ['admins', 'developers'];

    const { result } = renderWith(api, teams);
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(api).toHaveBeenCalledTimes(1);
    expect(api).toHaveBeenCalledWith(teams, 'production', '', 'last28days');
  });

  it('formats the figures Sleuth returned for a team', async () => {
    // the admins team in Sleuth, 15 Sep to 12 Oct 2026 against the 28 days before
    const team = await teamFor(range(15, 28, 10184, 13.33, 6150), range(10, 28, 9840, 10, 4080));

    expect(team.metrics).toEqual({
      deploymentFrequency: '0.54/day',
      leadTime: '2h 49m',
      failureRate: '13.3%',
      mttr: '1h 42m',
    });
    expect(team.raw).toEqual({ leadTimeSec: 10184, mttrSec: 6150 });
    expect(team.hasDeployments).toBe(true);
  });

  it('calls a team declining when its failure rate or lead time got worse', async () => {
    const team = await teamFor(range(15, 28, 10184, 13.33, 6150), range(10, 28, 9840, 10, 4080));

    expect(team.trend).toBe('down');
  });

  it('calls a team improving when it deploys more often and nothing got worse', async () => {
    const team = await teamFor(range(20, 28, 9000, 10, 3600), range(10, 28, 9000, 10, 3600));

    expect(team.trend).toBe('up');
  });

  it('judges frequency by deploy counts, which the rounded daily rate can hide', async () => {
    // 21 against 20 deploys in 90 days is 5% more, but both round to 0.23 and 0.22 per day: 4.5%
    const team = await teamFor(range(21, 90, 9000, 10, 3600), range(20, 90, 9000, 10, 3600));

    expect(team.trend).toBe('up');
  });

  it('gives no verdict for a team that deployed nothing, rather than stable with perfect numbers', async () => {
    const team = await teamFor(range(0, 28, 0, 0, 0), range(8, 28, 8227, 12.5, 7140));

    expect(team.hasDeployments).toBe(false);
    expect(team.trend).toBe('stable');
  });

  it('gives no verdict when there was nothing before to compare with', async () => {
    const team = await teamFor(range(15, 28, 10184, 13.33, 6150), range(0, 28, 0, 0, 0));

    expect(team.hasDeployments).toBe(true);
    expect(team.trend).toBe('stable');
  });

  it('returns no teams and an error when the request fails, so zeros are not shown as data', async () => {
    const { result } = renderWith(jest.fn().mockRejectedValue(new Error('boom')));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.teams).toEqual([]);
    expect(result.current.error).toBe('We are facing challenges at the moment. Please come back later.');
  });

  it('does not call the backend when the user has no teams', async () => {
    const api = jest.fn();
    const noTeams: string[] = [];

    const { result } = renderWith(api, noTeams);
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(api).not.toHaveBeenCalled();
    expect(result.current.teams).toEqual([]);
  });
});
