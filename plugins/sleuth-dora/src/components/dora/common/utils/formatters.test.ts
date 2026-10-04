import { MetricType } from '../types/metrics';
import { formatDuration, formatMetricValue } from './formatters';

describe('formatDuration', () => {
  it.each([
    [0, '0m'],
    [45, '45s'],
    [59, '59s'],
    [60, '1m'],
    [2700, '45m'],
    [3599, '59m'],
    [3600, '1h'],
    [3660, '1h 1m'],
    [6136, '1h 42m'],
    [86399, '23h 59m'],
    [86400, '1d'],
    [93600, '1d 2h'],
    [1534680, '17d 18h'],
  ])('formats %d seconds as %s', (seconds, expected) => {
    expect(formatDuration(seconds)).toBe(expected);
  });

  it('rounds down like Sleuth rather than to the nearest minute', () => {
    // 2h 48m 41s
    expect(formatDuration(10121)).toBe('2h 48m');
  });
});

describe('formatMetricValue', () => {
  it('formats each metric in its own unit', () => {
    expect(formatMetricValue(0.678, MetricType.Frequency)).toBe('0.68/day');
    expect(formatMetricValue(10121, MetricType.LeadTime)).toBe('2h 48m');
    expect(formatMetricValue(15.79, MetricType.FailureRate)).toBe('15.8%');
    expect(formatMetricValue(6136, MetricType.Mttr)).toBe('1h 42m');
  });
});
