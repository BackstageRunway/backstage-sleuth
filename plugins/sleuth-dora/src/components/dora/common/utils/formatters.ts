/**
 * Data formatting functions for DORA metrics
 */

import { MetricType } from '../types/metrics';

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
      const hours = value / 3600;
      return hours >= 1 ? `${hours.toFixed(1)}h` : `${(value / 60).toFixed(1)}m`;
    case MetricType.FailureRate:
      return `${value.toFixed(1)}%`;
    case MetricType.Mttr:
      const minutes = value / 60;
      return minutes >= 1 ? `${minutes.toFixed(1)}m` : `${value}s`;
    default:
      return value.toString();
  }
};

/**
 * Formats metric value for display (legacy function for compatibility)
 * @param metricName - Name of the metric
 * @param value - Raw metric value
 * @returns Formatted string value
 */
export const formatMetricValueLegacy = (metricName: MetricType, value: number): string => {
  return formatMetricValue(value, metricName);
};

/**
 * Formats time duration in seconds to human-readable format
 * @param seconds - Duration in seconds
 * @returns Formatted duration string
 */
export const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h`;
  }
  
  const days = Math.floor(hours / 24);
  return `${days}d`;
};

/**
 * Formats percentage with appropriate decimal places
 * @param value - Percentage value (0-100)
 * @param decimalPlaces - Number of decimal places (default: 1)
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number, decimalPlaces: number = 1): string => {
  return `${value.toFixed(decimalPlaces)}%`;
};

/**
 * Formats large numbers with appropriate suffixes (K, M, B)
 * @param value - Number to format
 * @returns Formatted number string
 */
export const formatLargeNumber = (value: number): string => {
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)}B`;
  }
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
};

/**
 * Formats metric name for display
 * @param metricType - Type of metric
 * @returns Formatted metric name
 */
export const formatMetricName = (metricType: MetricType): string => {
  switch (metricType) {
    case MetricType.Frequency:
      return 'Deployment Frequency';
    case MetricType.LeadTime:
      return 'Lead Time';
    case MetricType.FailureRate:
      return 'Change Failure Rate';
    case MetricType.Mttr:
      return 'Mean Time to Restore';
    default:
      return metricType;
  }
};

/**
 * Formats performance level for display
 * @param performance - Performance level
 * @returns Formatted performance string
 */
export const formatPerformance = (performance: string): string => {
  return performance.charAt(0).toUpperCase() + performance.slice(1).toLowerCase();
}; 