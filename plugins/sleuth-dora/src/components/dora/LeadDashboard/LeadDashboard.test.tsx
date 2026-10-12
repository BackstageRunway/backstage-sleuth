import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockApis, renderInTestApp, TestApiProvider } from '@backstage/test-utils';
import { configApiRef, identityApiRef } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { LeadDashboard } from './LeadDashboard';
import { doraBackendApiRef } from '../../../api/DORABackendClient';

const range = (numOfDeploys: number) => ({
  numOfDeploys,
  numOfDeploysPerDay: Math.round((numOfDeploys / 28) * 100) / 100,
  avgLeadTimeInSec: 10184,
  failureRatePercent: 10,
  avgMttrDurationInSec: 3600,
});

const sleuthTeam = (name: string) => ({ name, currentRange: range(15), previousRange: range(15) });

const user = (memberOf?: string[]) => ({
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'User',
  metadata: { name: 'guest', namespace: 'development' },
  spec: { memberOf },
});

const USER_REF = 'user:development/guest';

const renderDashboard = (options: {
  userEntity?: ReturnType<typeof user>;
  metrics?: jest.Mock;
  sleuthConfig?: Record<string, string>;
}) => {
  const getEntitiesByRefs = jest.fn().mockResolvedValue({ items: [options.userEntity] });
  const metrics = options.metrics ?? jest.fn().mockResolvedValue({ teams: [] });
  const rendered = renderInTestApp(
    <TestApiProvider
      apis={[
        [doraBackendApiRef, { getBatchTeamDORAMetrics: metrics } as any],
        [catalogApiRef, { getEntitiesByRefs } as any],
        [identityApiRef, mockApis.identity({ userEntityRef: USER_REF })],
        [configApiRef, mockApis.config({ data: { dora: { sleuth: { environment: 'production', ...options.sleuthConfig } } } })],
      ]}
    >
      <LeadDashboard />
    </TestApiProvider>,
  );
  return { rendered, getEntitiesByRefs, metrics };
};

describe('LeadDashboard', () => {
  it("asks Sleuth for the teams the signed-in user belongs to", async () => {
    const metrics = jest.fn().mockResolvedValue({ teams: [sleuthTeam('admins'), sleuthTeam('developers')] });

    const { rendered, getEntitiesByRefs } = renderDashboard({ userEntity: user(['admins', 'developers']), metrics });
    await rendered;

    expect((await screen.findAllByText('admins')).length).toBeGreaterThan(0);
    expect(screen.getAllByText('developers').length).toBeGreaterThan(0);
    expect(getEntitiesByRefs).toHaveBeenCalledWith({ entityRefs: [USER_REF] });
    expect(metrics).toHaveBeenLastCalledWith(['admins', 'developers'], 'production', '', 'last28days');
  });

  it('starts at the time range set in the app config', async () => {
    const metrics = jest.fn().mockResolvedValue({ teams: [sleuthTeam('admins')] });

    const { rendered } = renderDashboard({
      userEntity: user(['admins']),
      metrics,
      sleuthConfig: { defaultTimeRange: 'last90days' },
    });
    await rendered;
    await screen.findAllByText('admins');

    expect(metrics).toHaveBeenLastCalledWith(['admins'], 'production', '', 'last90days');
  });

  it('fetches again when another time range is picked', async () => {
    const metrics = jest.fn().mockResolvedValue({ teams: [sleuthTeam('admins')] });
    const { rendered } = renderDashboard({ userEntity: user(['admins']), metrics });
    await rendered;
    await screen.findAllByText('admins');

    await userEvent.click(screen.getByText('Last 7 Days'));

    expect(metrics).toHaveBeenLastCalledWith(['admins'], 'production', '', 'last7days');
  });

  it('shows only the team picked in the selector, without asking Sleuth again', async () => {
    const metrics = jest.fn().mockResolvedValue({ teams: [sleuthTeam('admins'), sleuthTeam('developers')] });
    const { rendered } = renderDashboard({ userEntity: user(['admins', 'developers']), metrics });
    await rendered;
    await screen.findAllByText('Deployment Frequency');
    expect(screen.getAllByText('Deployment Frequency')).toHaveLength(2);
    const callsBefore = metrics.mock.calls.length;

    await userEvent.click(screen.getByRole('button', { name: /Select Team/ }));
    await userEvent.click(within(screen.getByRole('listbox')).getByText('developers'));

    expect(screen.getAllByText('Deployment Frequency')).toHaveLength(1);
    expect(metrics.mock.calls.length).toBe(callsBefore);
  });

  it('says so when the user belongs to no team, and does not call Sleuth', async () => {
    const { rendered, metrics } = renderDashboard({ userEntity: user([]) });
    await rendered;

    expect(
      await screen.findByText('No teams found for your user account. Please check your entity relations.'),
    ).toBeInTheDocument();
    expect(metrics).not.toHaveBeenCalled();
  });

  it('treats a user without a memberOf list as belonging to no team', async () => {
    const { rendered, metrics } = renderDashboard({ userEntity: user(undefined) });
    await rendered;

    expect(await screen.findByText(/No teams found for your user account/)).toBeInTheDocument();
    expect(metrics).not.toHaveBeenCalled();
  });

  it('explains when the signed-in user has no entry in the catalog', async () => {
    const { rendered, metrics } = renderDashboard({ userEntity: undefined });
    await rendered;

    expect(await screen.findByText('Failed to load user teams: No user entity found')).toBeInTheDocument();
    expect(metrics).not.toHaveBeenCalled();
  });

  it('shows an error, not empty cards, when the team metrics cannot be loaded', async () => {
    const metrics = jest.fn().mockRejectedValue(new Error('Failed to query Sleuth API: PERMISSION_DENIED'));
    const { rendered } = renderDashboard({ userEntity: user(['admins']), metrics });
    await rendered;

    expect(await screen.findByText(/Failed to load team metrics:/)).toBeInTheDocument();
    expect(screen.queryByText('Deployment Frequency')).not.toBeInTheDocument();
  });
});
