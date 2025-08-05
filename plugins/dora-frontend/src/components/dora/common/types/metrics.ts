/**
 * Core DORA metric types and enums
 */

/**
 * DORA metric types
 */
export enum MetricType {
  Frequency = 'Frequency',
  LeadTime = 'LeadTime',
  FailureRate = 'FailureRate',
  Mttr = 'Mttr',
}

/**
 * Performance levels for metrics
 */
export enum Performance {
  Elite = 'Elite',
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
}

/**
 * Trend directions
 */
export type Trend = 'up' | 'down' | 'stable';

/**
 * Time range options for DORA metrics
 */
export type TimeRange = 'last7days' | 'last14days' | 'last28days' | 'last90days';



/**
 * Metric data interface for processed metrics
 */
export interface MetricData {
  metricName: MetricType;
  value: Performance;
  rawValue: number;
  previousValue: Performance;
  percentageChange: number;
  trend: Trend;
}

/**
 * API metric range interface
 */
export interface MetricRange {
  numOfDeploysPerDay: number;
  avgLeadTimeInSec: number;
  failureRatePercent: number;
  avgMttrDurationInSec: number;
}

/**
 * API metrics response interface
 */
export interface MetricsResponse {
  currentRange: MetricRange;
  previousRange: MetricRange;
}

/**
 * Gets the description for a performance level
 * @param performance - Performance level
 * @returns Description string
 */
export const getPerformanceDescription = (performance: Performance): string => {
  switch (performance) {
    case Performance.Elite:
      return 'Elite performance level';
    case Performance.High:
      return 'High performance level';
    case Performance.Medium:
      return 'Medium performance level';
    case Performance.Low:
      return 'Low performance level';
    default:
      return 'Unknown performance level';
  }
}; 