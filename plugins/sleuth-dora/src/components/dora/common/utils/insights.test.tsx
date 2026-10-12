import { MetricType } from '../types/metrics';
import { ApiInsight } from '../types/api';
import { getMetricInsights } from './insights';

const styles = { goodInsight: 'good', warningInsight: 'warning', criticalInsight: 'critical' };

// The insight lines for a metric, as text with the style of their icon
const insightsFor = (metricType: MetricType, value: number, percentageChange: number, apiInsight?: ApiInsight) =>
  getMetricInsights(metricType, value, percentageChange, styles, apiInsight).map(insight => ({
    text: insight.text,
    icon: insight.icon.props.className,
    type: insight.type,
  }));

describe('getMetricInsights', () => {
  it.each([
    [MetricType.Frequency, 2.32, 'Meeting elite deployment frequency target'],
    [MetricType.LeadTime, 10184, 'Meeting elite lead time target'],
    [MetricType.FailureRate, 4, 'Meeting elite failure rate target'],
    [MetricType.Mttr, 1800, 'Meeting elite MTTR target'],
  ])('praises an elite %s', (metricType, value, text) => {
    expect(insightsFor(metricType, value, 0)).toEqual([{ text, icon: 'good', type: 'PERFORMANCE' }]);
  });

  it.each([
    [MetricType.Frequency, 0.54, 'High performance; elite is at least one deploy per day'],
    [MetricType.LeadTime, 2 * 86400, 'High performance; elite is under one day'],
    [MetricType.FailureRate, 8, 'High performance; elite is 5% or less'],
    [MetricType.Mttr, 5854, 'High performance; elite is under one hour'],
  ])('tells a high %s what elite would take', (metricType, value, text) => {
    expect(insightsFor(metricType, value, 0)).toEqual([{ text, icon: 'good', type: 'PERFORMANCE' }]);
  });

  it.each([
    [MetricType.Frequency, 0.07, 'Consider deploying more often'],
    [MetricType.LeadTime, 1885879, 'Consider optimizing CI/CD pipeline'],
    [MetricType.FailureRate, 13.33, 'Consider improving test coverage'],
    [MetricType.Mttr, 3 * 86400, 'Consider improving incident response'],
  ])('warns about a medium %s', (metricType, value, text) => {
    expect(insightsFor(metricType, value, 0)).toEqual([{ text, icon: 'warning', type: 'PERFORMANCE' }]);
  });

  it.each([
    [MetricType.Frequency, 0.02, 'Deployment frequency needs immediate attention'],
    [MetricType.LeadTime, 17031829, 'Lead time needs immediate optimization'],
    [MetricType.FailureRate, 15.79, 'Failure rate needs immediate attention'],
    [MetricType.Mttr, 10 * 86400, 'MTTR needs immediate improvement'],
  ])('flags a low %s as critical', (metricType, value, text) => {
    expect(insightsFor(metricType, value, 0)).toEqual([{ text, icon: 'critical', type: 'PERFORMANCE' }]);
  });

  it('says there were no incidents instead of praising a zero MTTR', () => {
    expect(insightsFor(MetricType.Mttr, 0, 0)).toEqual([
      { text: 'No incidents in this period', icon: 'good', type: 'PERFORMANCE' },
    ]);
  });

  it('adds a trend line when frequency rose', () => {
    expect(insightsFor(MetricType.Frequency, 2.32, 50).map(i => i.text)).toContain('Deployment frequency is improving');
    expect(insightsFor(MetricType.Frequency, 2.32, -19)).toHaveLength(1);
  });

  it.each([
    [MetricType.LeadTime, 'Lead time is improving'],
    [MetricType.FailureRate, 'Failure rate is improving'],
    [MetricType.Mttr, 'Recovery time is improving'],
  ])('adds a trend line when %s fell, not when it rose', (metricType, text) => {
    expect(insightsFor(metricType, 100, -13)).toContainEqual({ text, icon: 'good', type: 'TREND' });
    expect(insightsFor(metricType, 100, 13).map(i => i.text)).not.toContain(text);
  });

  it('adds no trend line when there is nothing to compare with', () => {
    expect(insightsFor(MetricType.LeadTime, 17031829, NaN)).toHaveLength(1);
    // a metric appearing from nothing is only good news for frequency
    expect(insightsFor(MetricType.FailureRate, 13.95, Infinity)).toHaveLength(1);
    expect(insightsFor(MetricType.Frequency, 0.07, Infinity)).toHaveLength(2);
  });

  it("puts Sleuth's own insight first, marked good or as a warning by its icon", () => {
    const fromSleuth = (icon: string): ApiInsight => ({
      message: 'Your lead time is higher than your previous period by 40%.',
      icon,
      isPositive: false,
      metricType: 'LeadTime',
    });

    const warned = insightsFor(MetricType.LeadTime, 10184, 40, fromSleuth('lightbulb-exclamation'));
    expect(warned[0]).toEqual({
      text: 'Your lead time is higher than your previous period by 40%.',
      icon: 'warning',
      type: 'PERFORMANCE',
    });
    expect(warned[1].text).toBe('Meeting elite lead time target');

    expect(insightsFor(MetricType.LeadTime, 10184, 40, fromSleuth('sparkles'))[0].icon).toBe('good');
  });
});
