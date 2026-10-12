import { MetricType, Performance } from '../types/metrics';
import { mapMetricType, processInsights, processMetricsResponse } from './processors';

const range = (numOfDeploys: number, days: number, leadTime: number, failureRate: number, mttr: number) => ({
  numOfDeploys,
  numOfDeploysPerDay: Math.round((numOfDeploys / days) * 100) / 100,
  avgLeadTimeInSec: leadTime,
  failureRatePercent: failureRate,
  avgMttrDurationInSec: mttr,
});

const byName = (metrics: ReturnType<typeof processMetricsResponse>, name: MetricType) =>
  metrics.find(metric => metric.metricName === name)!;

describe('processMetricsResponse', () => {
  it('takes the frequency change from deploy counts, not the rounded daily rate', () => {
    // payments-service over 90 days: 0.48/day against 0.07/day would give 586%
    const metrics = processMetricsResponse({
      currentRange: range(43, 90, 10158, 13.95, 5657),
      previousRange: range(6, 90, 7110, 0, 3980),
    });

    expect(byName(metrics, MetricType.Frequency).percentageChange).toBe(616.7);
    expect(byName(metrics, MetricType.Frequency).trend).toBe('up');
  });

  it('falls back to the daily rate when the response has no deploy counts', () => {
    const metrics = processMetricsResponse({
      currentRange: { numOfDeploysPerDay: 2, avgLeadTimeInSec: 100, failureRatePercent: 5, avgMttrDurationInSec: 60 },
      previousRange: { numOfDeploysPerDay: 1, avgLeadTimeInSec: 100, failureRatePercent: 5, avgMttrDurationInSec: 60 },
    });

    expect(byName(metrics, MetricType.Frequency).percentageChange).toBe(100);
  });

  it('does not rate or compare lead time and failure rate against a period without deployments', () => {
    // the backstage deployment over 28 days: 2 deploys now, none before
    const metrics = processMetricsResponse({
      currentRange: range(2, 28, 17031829, 0, 5854),
      previousRange: range(0, 28, 0, 0, 6694),
    });

    const leadTime = byName(metrics, MetricType.LeadTime);
    expect(leadTime.value).toBe(Performance.Low);
    expect(leadTime.previousValue).toBeNull();
    expect(leadTime.percentageChange).toBeNaN();
    expect(leadTime.trend).toBe('stable');

    const failureRate = byName(metrics, MetricType.FailureRate);
    expect(failureRate.previousValue).toBeNull();
    expect(failureRate.percentageChange).toBeNaN();

    // frequency really did start from nothing, and MTTR is measured for the whole project
    expect(byName(metrics, MetricType.Frequency).percentageChange).toBe(Infinity);
    expect(byName(metrics, MetricType.Mttr).previousValue).toBe(Performance.High);
  });

  it('still compares against a previous period that had deployments', () => {
    const metrics = processMetricsResponse({
      currentRange: range(65, 28, 1885879, 10.77, 5854),
      previousRange: range(80, 28, 540435, 10, 6694),
    });

    expect(byName(metrics, MetricType.Frequency).percentageChange).toBe(-18.7);
    expect(byName(metrics, MetricType.LeadTime).percentageChange).toBe(249);
    expect(byName(metrics, MetricType.LeadTime).previousValue).toBe(Performance.High);
  });
});

describe('mapMetricType', () => {
  it('maps the insights that belong to a DORA card', () => {
    expect(mapMetricType('FREQUENCY')).toBe(MetricType.Frequency);
    expect(mapMetricType('LEAD_TIME')).toBe(MetricType.LeadTime);
    expect(mapMetricType('FAILURE_RATE')).toBe(MetricType.FailureRate);
    expect(mapMetricType('MTTR')).toBe(MetricType.Mttr);
  });

  it('keeps deploying time, a part of lead time, off the frequency card', () => {
    expect(mapMetricType('DEPLOYING')).not.toBe(MetricType.Frequency);
  });
});

describe('processInsights', () => {
  it('keeps only the insights that carry a message', () => {
    const insights = processInsights([
      { __typename: 'TeamMetricLowInsightType' },
      {
        __typename: 'MetricOffsetFromAverageInsightType',
        insightMetricType: 'LEAD_TIME',
        message: 'Your lead time is higher than your previous period by 40%.',
        icon: 'lightbulb-exclamation',
        isPositive: false,
      },
      { __typename: 'WorstDeployInsightType' },
    ]);

    expect(insights).toHaveLength(1);
    expect(insights[0].metricType).toBe(MetricType.LeadTime);
    expect(insights[0].status).toBe('warning');
  });
});
