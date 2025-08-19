/**
 * Performance threshold constants for DORA metrics
 */

/**
 * Trend change thresholds for determining metric trends
 */
export const TREND_THRESHOLDS = {
  SIGNIFICANT_CHANGE: 5.0, // 5% change is considered significant
  MINOR_CHANGE: 2.0,       // 2% change is considered minor
  STABLE_THRESHOLD: 1.0,   // Below 1% is considered stable
} as const;

import { MetricType, Performance } from '../types/metrics';

/**
 * Performance level thresholds for each metric type
 */
export const PERFORMANCE_THRESHOLDS = {
  [MetricType.Frequency]: {
    [Performance.Elite]: 1.0,
    [Performance.High]: 0.5,
    [Performance.Medium]: 0.1,
    [Performance.Low]: 0,
  },
  [MetricType.LeadTime]: {
    [Performance.Elite]: 3600, // 1 hour
    [Performance.High]: 86400, // 24 hours
    [Performance.Medium]: 604800, // 1 week
    [Performance.Low]: Infinity,
  },
  [MetricType.FailureRate]: {
    [Performance.Elite]: 5,
    [Performance.High]: 10,
    [Performance.Medium]: 15,
    [Performance.Low]: Infinity,
  },
  [MetricType.Mttr]: {
    [Performance.Elite]: 3600, // 1 hour
    [Performance.High]: 86400, // 24 hours
    [Performance.Medium]: 604800, // 1 week
    [Performance.Low]: Infinity,
  },
} as const;

/**
 * Time conversion constants
 */
export const TIME_CONVERSIONS = {
  SECONDS_PER_MINUTE: 60,
  SECONDS_PER_HOUR: 3600,
  SECONDS_PER_DAY: 86400,
  SECONDS_PER_WEEK: 604800,
} as const;

/**
 * Display thresholds for formatting
 */
export const DISPLAY_THRESHOLDS = {
  HOURS_THRESHOLD: 3600,    // Show hours if >= 1 hour
  MINUTES_THRESHOLD: 60,     // Show minutes if >= 1 minute
  DAYS_THRESHOLD: 86400,     // Show days if >= 1 day
} as const; 