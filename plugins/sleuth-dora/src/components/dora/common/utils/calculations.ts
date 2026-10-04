/**
 * Pure calculation functions for DORA metrics
 */

import { MetricType, Performance } from '../types/metrics';
import { PERFORMANCE_THRESHOLDS } from '../constants/thresholds';

/**
 * Calculates the percentage change between current and previous values
 * @param current - Current value
 * @param previous - Previous value
 * @returns Percentage change rounded to 1 decimal place; Infinity when there was nothing before
 */
export const calculateTrendChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? Infinity : 0;
  const result = ((current - previous) / previous) * 100;
  // Round to 1 decimal place to match Sleuth's formatting
  return Math.round(result * 10) / 10;
};

/**
 * Calculates the percentage change between current and previous values (simple version)
 * Used in some contexts where rounding is not required
 * @param current - Current value
 * @param previous - Previous value
 * @returns Percentage change; Infinity when there was nothing before
 */
export const calculateTrendChangeSimple = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? Infinity : 0;
  return ((current - previous) / previous) * 100;
};

/**
 * Determines the performance level for a metric based on its value
 * @param metricType - Type of metric
 * @param value - Raw metric value
 * @returns Performance level
 */
export const getMetricPerformance = (metricType: MetricType, value: number): Performance => {
  const thresholds = PERFORMANCE_THRESHOLDS[metricType];
  
  // For Lead Time and MTTR, lower values are better (use <= comparison)
  if (metricType === MetricType.LeadTime || metricType === MetricType.Mttr) {
    if (value <= thresholds[Performance.Elite]) return Performance.Elite;
    if (value <= thresholds[Performance.High]) return Performance.High;
    if (value <= thresholds[Performance.Medium]) return Performance.Medium;
    return Performance.Low;
  }
  
  // For Frequency and Failure Rate, higher frequency is better, lower failure rate is better
  if (metricType === MetricType.Frequency) {
    if (value >= thresholds[Performance.Elite]) return Performance.Elite;
    if (value >= thresholds[Performance.High]) return Performance.High;
    if (value >= thresholds[Performance.Medium]) return Performance.Medium;
    return Performance.Low;
  }
  
  if (metricType === MetricType.FailureRate) {
    if (value <= thresholds[Performance.Elite]) return Performance.Elite;
    if (value <= thresholds[Performance.High]) return Performance.High;
    if (value <= thresholds[Performance.Medium]) return Performance.Medium;
    return Performance.Low;
  }
  
  return Performance.Low;
};

/**
 * Determines the trend direction for a metric
 * @param current - Current value
 * @param previous - Previous value
 * @param metricType - Type of metric
 * @returns Trend direction: 'up', 'down', or 'stable'
 */
export const determineTrend = (current: number, previous: number, metricType: MetricType): 'up' | 'down' | 'stable' => {
  const change = calculateTrendChangeSimple(current, previous);

  // Only for frequency is a rise good; for lead time, failure rate and MTTR lower is better
  const improvement = metricType === MetricType.Frequency ? change : -change;
  if (improvement >= 5) return 'up';
  if (improvement <= -5) return 'down';
  return 'stable';
};

/**
 * Determines overall trend based on key metrics
 * Prioritizes negative trends (declining performance)
 * @param frequencyTrend - Trend for deployment frequency
 * @param leadTimeTrend - Trend for lead time
 * @param failureRateTrend - Trend for failure rate
 * @returns Overall trend direction
 */
export const determineOverallTrend = (
  frequencyTrend: 'up' | 'down' | 'stable',
  leadTimeTrend: 'up' | 'down' | 'stable',
  failureRateTrend: 'up' | 'down' | 'stable'
): 'up' | 'down' | 'stable' => {
  // Prioritize negative trends (declining performance)
  if (failureRateTrend === 'down' || leadTimeTrend === 'down') {
    return 'down';
  }
  
  // If no negative trends, check for positive frequency trend
  if (frequencyTrend === 'up') {
    return 'up';
  }
  
  return 'stable';
};

/**
 * Gets the trend direction for a metric (legacy function for compatibility)
 * @param metricType - Type of metric
 * @param current - Current value
 * @param previous - Previous value
 * @returns Trend direction
 */
export const getTrend = (metricType: MetricType, current: number, previous: number): 'up' | 'down' | 'stable' => {
  return determineTrend(current, previous, metricType);
}; 