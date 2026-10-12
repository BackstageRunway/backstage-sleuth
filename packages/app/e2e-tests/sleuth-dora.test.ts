import { test, expect, Page } from '@playwright/test';

// The Sleuth dashboards in a real browser. The plugin backend is answered here with figures recorded
// from Sleuth, so the tests need no API key and always see the same numbers.

const recap = (numOfDeploys: number, days: number, leadTime: number, failureRate: number, mttr: number) => ({
  numOfDeploys,
  numOfDeploysPerDay: Math.round((numOfDeploys / days) * 100) / 100,
  avgLeadTimeInSec: leadTime,
  failureRatePercent: failureRate,
  avgMttrDurationInSec: mttr,
});

const NOTHING = recap(0, 7, 0, 0, 0);

const slice = (startIncl: string, perDay: number, leadTime: number, failureRate: number, mttr: number) => ({
  startIncl,
  endNotIncl: startIncl,
  numOfDeploysPerDay: perDay,
  avgLeadTimeInSec: leadTime,
  failureRatePercent: failureRate,
  avgMttrDurationInSec: mttr,
});

// Organisation, 15 Sep to 12 Oct 2026 against the 28 days before
const ORGANIZATION_28_DAYS = {
  previousRecap: recap(80, 28, 540435, 10, 6694),
  metricsRecapWithQuarters: {
    totalRecap: recap(65, 28, 1885879, 10.77, 5854),
    quarters: [
      slice('2026-09-15T00:00:00+00:00', 3.57, 1496029, 8, 4380),
      slice('2026-09-22T00:00:00+00:00', 2.57, 1468050, 11.11, 8850),
      slice('2026-09-29T00:00:00+00:00', 3.14, 2670752, 13.64, 4840),
      slice('2026-10-06T00:00:00+00:00', 0, 0, 0, 0),
    ],
  },
};

const ORGANIZATION_7_DAYS = {
  previousRecap: recap(22, 7, 2670752, 13.64, 4840),
  metricsRecapWithQuarters: {
    totalRecap: NOTHING,
    quarters: [slice('2026-10-06T00:00:00+00:00', 0, 0, 0, 0), slice('2026-10-09T12:00:00+00:00', 0, 0, 0, 0)],
  },
};

// payments-service, same periods
const PROJECT_28_DAYS = {
  project: { currentRange: recap(15, 28, 10184, 13.33, 5854), previousRange: recap(10, 28, 9840, 10, 6694) },
};

const team = (name: string, current: object, previous: object) => ({ name, currentRange: current, previousRange: previous });

const UNKNOWN_DEPLOYMENT =
  'Sleuth has no code deployment "sleuth" in project "backstagerunway-app". ' +
  'Check the sleuth.io/code-deployment-slug annotation on this component.';

const answerBackend = (page: Page) =>
  page.route('**/api/sleuth-dora-backend/**', async route => {
    const request = route.request();
    const url = new URL(request.url());
    const timeRange = url.searchParams.get('timeRange') ?? request.postDataJSON()?.timeRange;
    const sevenDays = timeRange === 'last7days';
    const json = (body: unknown, status = 200) =>
      route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });

    if (url.pathname.endsWith('/org-trend-metrics')) {
      return json({ organization: sevenDays ? ORGANIZATION_7_DAYS : ORGANIZATION_28_DAYS });
    }
    if (url.pathname.endsWith('/batch-team-metrics')) {
      const teams: string[] = request.postDataJSON().teamSlugs;
      return json({
        teams: teams.map(name =>
          sevenDays
            ? team(name, NOTHING, recap(8, 7, 8227, 12.5, 7140))
            : team(name, recap(15, 28, 10184, 13.33, 6150), recap(10, 28, 9840, 10, 4080)),
        ),
      });
    }
    if (url.searchParams.get('deploymentId') === 'sleuth') {
      return json({ error: UNKNOWN_DEPLOYMENT }, 404);
    }
    if (url.pathname.includes('/metrics-insights/')) {
      return json({
        project: {
          insights: [
            {
              __typename: 'MetricOffsetFromAverageInsightType',
              insightMetricType: 'FAILURE_RATE',
              message: 'Your failure rate is higher than your previous period by 33%.',
              icon: 'lightbulb-exclamation',
              isPositive: false,
            },
          ],
        },
      });
    }
    return json(PROJECT_28_DAYS);
  });

const signIn = async (page: Page, path: string) => {
  await answerBackend(page);
  await page.goto(path);
  await page.getByRole('button', { name: 'Enter' }).click();
};

// Set SLEUTH_E2E_SCREENSHOTS to a folder to keep a picture of each screen for a visual check
const snapshot = async (page: Page, name: string) => {
  const folder = process.env.SLEUTH_E2E_SCREENSHOTS;
  if (folder) {
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${folder}/${name}.png`, fullPage: true });
  }
};

test.describe('Sleuth dashboards', () => {
  test('the executive dashboard shows totals and their change against the previous period', async ({ page }) => {
    await signIn(page, '/dora-elt');

    await expect(page.getByText('2.32/day')).toBeVisible();
    await expect(page.getByText('21d 19h')).toBeVisible();
    await expect(page.getByText('10.8%')).toBeVisible();
    await expect(page.getByText('1h 37m', { exact: true })).toBeVisible();
    for (const change of ['19%', '249%', '8%', '13%']) {
      await expect(page.getByText(change, { exact: true })).toBeVisible();
    }
    await expect(page.getByText('vs previous period')).toHaveCount(4);
    await snapshot(page, 'executive-28-days');
  });

  test('the executive dashboard says there were no deployments instead of showing zeros', async ({ page }) => {
    await signIn(page, '/dora-elt');
    await expect(page.getByText('2.32/day')).toBeVisible();

    await page.getByText('Last 7 Days').click();

    await expect(page.getByText('No deployments recorded in Sleuth in this period.')).toBeVisible();
    await expect(page.getByText('2.32/day')).toHaveCount(0);
    await snapshot(page, 'executive-7-days-empty');
  });

  test("the team dashboard shows the signed-in user's teams", async ({ page }) => {
    await signIn(page, '/dora-team');

    // once on each team card; the chart centre shows the average, which is the same figure
    await expect(page.getByText('0.54/day', { exact: true })).toHaveCount(3);
    await expect(page.getByText('Declining', { exact: true })).toHaveCount(2);
    await expect(page.getByText('Avg Lead Time')).toBeVisible();
    await snapshot(page, 'team-28-days');
  });

  test('the team dashboard marks teams without deployments', async ({ page }) => {
    await signIn(page, '/dora-team');
    await expect(page.getByText('Avg Lead Time')).toBeVisible();

    await page.getByText('Last 7 Days').click();

    await expect(page.getByText('No deployments', { exact: true })).toHaveCount(2);
    await expect(page.getByText('No deployments recorded in Sleuth for these teams in this period.')).toBeVisible();
    await expect(page.getByText('Stable')).toHaveCount(0);
    await snapshot(page, 'team-7-days-empty');
  });

  test('a component shows its Sleuth metrics, trends and insight on the Sleuth tab', async ({ page }) => {
    await signIn(page, '/catalog/default/component/backstage-with-code-deployment-slug/sleuth');

    await expect(page.getByText('DORA Metrics Overview')).toBeVisible();
    await expect(page.getByText('0.54/day')).toBeVisible();
    await expect(page.getByText('2h 49m')).toBeVisible();
    await expect(page.getByText('13.3%')).toBeVisible();
    await expect(page.getByText('Your failure rate is higher than your previous period by 33%.')).toBeVisible();
    await expect(page.getByText('whole project')).toBeVisible();
    await snapshot(page, 'component-28-days');
  });

  test('a component that is not mapped to Sleuth explains how to fix it', async ({ page }) => {
    await signIn(page, '/catalog/default/component/sleuth/sleuth');

    await expect(page.getByText(/has no Sleuth annotations/)).toBeVisible();
    await expect(page.getByText(UNKNOWN_DEPLOYMENT)).toBeVisible();
    await expect(page.getByText('DORA Metrics Overview')).toHaveCount(0);
    await snapshot(page, 'component-unmapped');
  });
});
