/**
 * Data transformation functions for DORA metrics
 */

import { MetricType, MetricData, MetricsResponse } from '../types/metrics';
import { ApiInsight } from '../types/api';
import { calculateTrendChange, calculateTrendChangeSimple, getMetricPerformance, determineTrend } from './calculations';

/**
 * Creates a MetricData object for a specific metric type
 * @param metricType - The type of metric
 * @param currentValue - Current value from API
 * @param previousValue - Previous value from API
 * @param useRoundedCalculation - Whether to use rounded trend calculation
 * @returns Processed MetricData object
 */
export const createMetricData = (
  metricType: MetricType,
  currentValue: number,
  previousValue: number,
  useRoundedCalculation: boolean = true
): MetricData => {
  const calculateChange = useRoundedCalculation ? calculateTrendChange : calculateTrendChangeSimple;
  
  return {
    metricName: metricType,
    value: getMetricPerformance(metricType, currentValue),
    rawValue: currentValue,
    previousValue: getMetricPerformance(metricType, previousValue),
    percentageChange: calculateChange(currentValue, previousValue),
    trend: determineTrend(currentValue, previousValue, metricType),
  };
};

/**
 * Processes a complete metrics response and returns an array of MetricData objects
 * @param response - API response with current and previous ranges
 * @param useRoundedCalculation - Whether to use rounded trend calculation
 * @returns Array of processed MetricData objects
 */
export const processMetricsResponse = (
  response: MetricsResponse,
  useRoundedCalculation: boolean = true
): MetricData[] => {
  const { currentRange, previousRange } = response;
  const calculateChange = useRoundedCalculation ? calculateTrendChange : calculateTrendChangeSimple;

  const metrics = [
    createMetricData(
      MetricType.Frequency,
      currentRange.numOfDeploysPerDay,
      previousRange.numOfDeploysPerDay,
      useRoundedCalculation
    ),
    createMetricData(
      MetricType.LeadTime,
      currentRange.avgLeadTimeInSec,
      previousRange.avgLeadTimeInSec,
      useRoundedCalculation
    ),
    createMetricData(
      MetricType.FailureRate,
      currentRange.failureRatePercent,
      previousRange.failureRatePercent,
      useRoundedCalculation
    ),
    createMetricData(
      MetricType.Mttr,
      currentRange.avgMttrDurationInSec,
      previousRange.avgMttrDurationInSec,
      useRoundedCalculation
    ),
  ];

  // Sleuth rounds deploys per day to two decimals, which skews the change for rarely deployed code;
  // the periods are equally long, so the deploy counts give the exact figure
  if (currentRange.numOfDeploys !== undefined && previousRange.numOfDeploys !== undefined) {
    const frequency = metrics[0];
    frequency.percentageChange = calculateChange(currentRange.numOfDeploys, previousRange.numOfDeploys);
    frequency.trend = determineTrend(currentRange.numOfDeploys, previousRange.numOfDeploys, MetricType.Frequency);
  }

  // With no deployments before, a zero lead time or failure rate is missing data, not an elite result
  if (previousRange.numOfDeploys === 0) {
    metrics
      .filter(metric => metric.metricName === MetricType.LeadTime || metric.metricName === MetricType.FailureRate)
      .forEach(metric => {
        metric.previousValue = null;
        metric.percentageChange = NaN;
        metric.trend = 'stable';
      });
  }

  return metrics;
};

/**
 * Maps metric type from API response to frontend format
 * @param insightMetricType - Metric type from API
 * @returns Mapped metric type for frontend
 */
export const mapMetricType = (insightMetricType: string): string => {
  switch (insightMetricType) {
    // DEPLOYING is Sleuth's deploying time, a part of lead time, not how often deploys happen
    case 'FREQUENCY':
      return 'Frequency';
    case 'LEAD_TIME':
      return 'LeadTime';
    case 'MTTR':
      return 'Mttr';
    case 'FAILURE_RATE':
      return 'FailureRate';
    default:
      return insightMetricType;
  }
};

/**
 * Processes raw insights from API and converts them to frontend format
 * @param insights - Raw insights from API
 * @returns Processed insights for frontend display
 */
export const processInsights = (insights: any[]): ApiInsight[] => {
  return insights
    .filter((insight: any) => insight.__typename === 'MetricOffsetFromAverageInsightType')
    .map((insight: any) => ({
      message: insight.message,
      icon: insight.icon,
      isPositive: insight.isPositive,
      metricType: mapMetricType(insight.insightMetricType),
      status: insight.isPositive ? 'good' : 'warning',
      summary: insight.message,
    }));
};
