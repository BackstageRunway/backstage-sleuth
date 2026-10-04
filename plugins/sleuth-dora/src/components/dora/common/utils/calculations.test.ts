import { MetricType, Performance } from '../types/metrics';
import {
  calculateTrendChange,
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

  it('rates failure rate at the 5, 10 and 15 percent boundaries', () => {
    expect(getMetricPerformance(MetricType.FailureRate, 5)).toBe(Performance.Elite);
    expect(getMetricPerformance(MetricType.FailureRate, 10)).toBe(Performance.High);
    expect(getMetricPerformance(MetricType.FailureRate, 12.2)).toBe(Performance.Medium);
    expect(getMetricPerformance(MetricType.FailureRate, 15.1)).toBe(Performance.Low);
  });
});
