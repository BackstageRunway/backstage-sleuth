/**
 * Data formatting functions for DORA metrics
 */

import { MetricType } from '../types/metrics';

/**
 * Formats a duration the way Sleuth does: the two largest units, rounded down, e.g. "45m", "1h 42m", "17d 23h"
 * @param seconds - Duration in seconds
 * @returns Formatted duration string
 */
export const formatDuration = (seconds: number): string => {
  if (!seconds) return '0m';
  if (seconds < 60) return `${Math.floor(seconds)}s`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;

  if (minutes < 24 * 60) {
    const rest = minutes % 60;
    return rest ? `${Math.floor(minutes / 60)}h ${rest}m` : `${Math.floor(minutes / 60)}h`;
  }

  const hours = Math.floor(seconds / 3600);
  const rest = hours % 24;
  return rest ? `${Math.floor(hours / 24)}d ${rest}h` : `${Math.floor(hours / 24)}d`;
};

/**
 * Formats metric value for display
 * @param value - Raw metric value
 * @param metricType - Type of metric
 * @returns Formatted string value
 */
export const formatMetricValue = (value: number, metricType: MetricType): string => {
  switch (metricType) {
    case MetricType.Frequency:
      return `${value.toFixed(2)}/day`;
    case MetricType.LeadTime:
      return formatDuration(value);
    case MetricType.FailureRate:
      return `${value.toFixed(1)}%`;
    case MetricType.Mttr:
      return formatDuration(value);
    default:
      return value.toString();
  }
};
