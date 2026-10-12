/**
 * Performance threshold constants for DORA metrics
 */

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
