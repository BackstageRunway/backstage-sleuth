import { MetricType, Performance } from '../types/metrics';
import {
  calculateTrendChange,
  describePeriodTrend,
  determineOverallTrend,
  determineTrend,
  getMetricPerformance,
} from './calculations';

describe('calculateTrendChange', () => {
  it('returns the percentage change rounded to one decimal', () => {
    expect(calculateTrendChange(0.68, 0.39)).toBe(74.4);
    expect(calculateTrendChange(50, 100)).toBe(-50);
  });

  it('has no percentage when the previous value was zero', () => {
    expect(calculateTrendChange(15.8, 0)).toBe(Infinity);
    expect(calculateTrendChange(0, 0)).toBe(0);
  });
});

describe('determineTrend', () => {
  it('treats a rise in frequency as improving', () => {
    expect(determineTrend(2, 1, MetricType.Frequency)).toBe('up');
    expect(determineTrend(1, 2, MetricType.Frequency)).toBe('down');
  });

  it.each([MetricType.LeadTime, MetricType.FailureRate, MetricType.Mttr])(
    'treats a rise in %s as declining',
    metricType => {
      expect(determineTrend(2, 1, metricType)).toBe('down');
      expect(determineTrend(1, 2, metricType)).toBe('up');
    },
  );

  it('ignores changes under five percent', () => {
    expect(determineTrend(102, 100, MetricType.LeadTime)).toBe('stable');
  });

  it('treats a failure rate rising from zero as declining', () => {
    expect(determineTrend(15.8, 0, MetricType.FailureRate)).toBe('down');
  });
});

describe('determineOverallTrend', () => {
  it('is declining when failure rate or lead time declines, whatever frequency does', () => {
    expect(determineOverallTrend('up', 'stable', 'down')).toBe('down');
    expect(determineOverallTrend('up', 'down', 'stable')).toBe('down');
  });

  it('is improving only when frequency improves and nothing declines', () => {
    expect(determineOverallTrend('up', 'stable', 'up')).toBe('up');
    expect(determineOverallTrend('stable', 'up', 'up')).toBe('stable');
  });
});

describe('getMetricPerformance', () => {
  // The values Sleuth rated for payments-service, 7 Sep to 4 Oct 2026
  it('matches the ratings Sleuth showed for the same values', () => {
    expect(getMetricPerformance(MetricType.Frequency, 0.68)).toBe(Performance.High);
    expect(getMetricPerformance(MetricType.LeadTime, 10121)).toBe(Performance.Elite);
    expect(getMetricPerformance(MetricType.FailureRate, 15.79)).toBe(Performance.Low);
    expect(getMetricPerformance(MetricType.Mttr, 6136)).toBe(Performance.High);
  });

  it('rates frequency by the daily, weekly and monthly bands', () => {
    expect(getMetricPerformance(MetricType.Frequency, 1)).toBe(Performance.Elite);
    // 43 deploys in 90 days: more than weekly, less than daily
    expect(getMetricPerformance(MetricType.Frequency, 0.48)).toBe(Performance.High);
    // 2 deploys in 28 days: more than monthly, less than weekly
    expect(getMetricPerformance(MetricType.Frequency, 0.07)).toBe(Performance.Medium);
    expect(getMetricPerformance(MetricType.Frequency, 0.02)).toBe(Performance.Low);
  });

  it('rates failure rate at the 5, 10 and 15 percent boundaries', () => {
    expect(getMetricPerformance(MetricType.FailureRate, 5)).toBe(Performance.Elite);
    expect(getMetricPerformance(MetricType.FailureRate, 10)).toBe(Performance.High);
    expect(getMetricPerformance(MetricType.FailureRate, 12.2)).toBe(Performance.Medium);
    expect(getMetricPerformance(MetricType.FailureRate, 15.1)).toBe(Performance.Low);
  });
});

describe('describePeriodTrend', () => {
  // Organisation figures from Sleuth for 15 Sep to 12 Oct 2026 against the 28 days before
  it('reports the change against the previous period', () => {
    expect(describePeriodTrend(MetricType.Frequency, 65, 80)).toEqual({ trend: 'down', change: '19%', isImproving: false });
    expect(describePeriodTrend(MetricType.LeadTime, 1885879, 540435)).toEqual({ trend: 'up', change: '249%', isImproving: false });
    expect(describePeriodTrend(MetricType.FailureRate, 10.77, 10)).toEqual({ trend: 'up', change: '8%', isImproving: false });
    expect(describePeriodTrend(MetricType.Mttr, 5854, 6694)).toEqual({ trend: 'down', change: '13%', isImproving: true });
  });

  it('counts a rise as an improvement only for frequency', () => {
    expect(describePeriodTrend(MetricType.Frequency, 3, 2).isImproving).toBe(true);
    expect(describePeriodTrend(MetricType.LeadTime, 3, 2).isImproving).toBe(false);
  });

  it('is flat and neither good nor bad when nothing changed', () => {
    expect(describePeriodTrend(MetricType.FailureRate, 10, 10)).toEqual({ trend: 'flat', change: '0%', isImproving: false });
  });

  it('caps very large changes', () => {
    expect(describePeriodTrend(MetricType.Frequency, 236, 20).change).toBe('>999%');
  });

  it('says what a metric rose from when the previous value was zero', () => {
    expect(describePeriodTrend(MetricType.Frequency, 5, 0)).toEqual({ trend: 'up', change: 'new', isImproving: true });
    expect(describePeriodTrend(MetricType.FailureRate, 13.95, 0).change).toBe('from 0%');
    expect(describePeriodTrend(MetricType.Mttr, 4780, 0).change).toBe('from 0m');
  });

  it('makes no comparison when a period has no deployments to measure', () => {
    expect(describePeriodTrend(MetricType.LeadTime, 1885879, 0, false)).toEqual({ trend: 'flat', change: 'n/a', isImproving: false });
  });
});
