/**
 * Metric-related constants for DORA plugin
 */

import { MetricType } from '../types/metrics';

/**
 * Metric display names
 */
export const METRIC_DISPLAY_NAMES = {
  [MetricType.Frequency]: 'Deployment Frequency',
  [MetricType.LeadTime]: 'Lead Time for Changes',
  [MetricType.FailureRate]: 'Change Failure Rate',
  [MetricType.Mttr]: 'Mean Time to Restore',
} as const;

/**
 * Metric units for display
 */
export const METRIC_UNITS = {
  [MetricType.Frequency]: '/day',
  [MetricType.LeadTime]: 'hours',
  [MetricType.FailureRate]: '%',
  [MetricType.Mttr]: 'hours',
} as const;

/**
 * Metric descriptions
 */
export const METRIC_DESCRIPTIONS = {
  [MetricType.Frequency]: 'How often an organization successfully releases to production',
  [MetricType.LeadTime]: 'The amount of time it takes to go from code committed to code successfully running in production',
  [MetricType.FailureRate]: 'The percentage of deployments causing a failure in production',
  [MetricType.Mttr]: 'The amount of time it takes to restore service after a failure in production',
} as const;

/**
 * Metric colors for charts and UI
 */
export const METRIC_COLORS = {
  [MetricType.Frequency]: '#2ecc71', // Green
  [MetricType.LeadTime]: '#3498db',  // Blue
  [MetricType.FailureRate]: '#e74c3c', // Red
  [MetricType.Mttr]: '#f1c40f',      // Yellow
} as const;

/**
 * Metric icons for UI display
 */
export const METRIC_ICONS = {
  [MetricType.Frequency]: '🚀',
  [MetricType.LeadTime]: '⏱️',
  [MetricType.FailureRate]: '❌',
  [MetricType.Mttr]: '🔧',
} as const;

/**
 * Default metric values for testing and fallbacks
 */
export const DEFAULT_METRIC_VALUES = {
  [MetricType.Frequency]: 0.5,
  [MetricType.LeadTime]: 86400, // 24 hours in seconds
  [MetricType.FailureRate]: 5.0,
  [MetricType.Mttr]: 3600, // 1 hour in seconds
} as const; 