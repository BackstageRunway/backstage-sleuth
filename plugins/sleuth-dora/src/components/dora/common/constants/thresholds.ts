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
 * Based on official DORA metrics research and Sleuth.io standards
 */
export const PERFORMANCE_THRESHOLDS = {
  [MetricType.Frequency]: {
    [Performance.Elite]: 1.0,     // Multiple deploys per day
    [Performance.High]: 1 / 7,    // Once per day to once per week
    [Performance.Medium]: 1 / 30, // Once per week to once per month
    [Performance.Low]: 0,         // Less than once per month
  },
  [MetricType.LeadTime]: {
    [Performance.Elite]: 86400,   // Less than one day (24 hours)
    [Performance.High]: 604800,   // One day to one week
    [Performance.Medium]: 2592000, // One week to one month (30 days)
    [Performance.Low]: Infinity,  // More than one month
  },
  [MetricType.FailureRate]: {
    [Performance.Elite]: 5,       // 0-5%
    [Performance.High]: 10,       // 5-10%
    [Performance.Medium]: 15,     // 10-15%
    [Performance.Low]: Infinity,  // > 15%
  },
  [MetricType.Mttr]: {
    [Performance.Elite]: 3600,    // Less than one hour
    [Performance.High]: 86400,    // Less than one day
    [Performance.Medium]: 604800, // Less than one week
    [Performance.Low]: Infinity,  // More than one week
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