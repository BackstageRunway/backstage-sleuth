/**
 * Data transformation functions for DORA metrics
 */

import { MetricType, MetricData, MetricsResponse } from '../types/metrics';
import { ApiInsight, ProjectMetricsResponse, TeamMetricsResponse, OrganizationMetricsResponse } from '../types/api';
import { calculateTrendChange, calculateTrendChangeSimple, getMetricPerformance, determineTrend, determineOverallTrend } from './calculations';

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
  
  return [
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
};

/**
 * Maps metric type from API response to frontend format
 * @param insightMetricType - Metric type from API
 * @returns Mapped metric type for frontend
 */
export const mapMetricType = (insightMetricType: string): string => {
  switch (insightMetricType) {
    case 'DEPLOYING':
    case 'FREQUENCY':
      return 'Frequency';
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

/**
 * Transforms team data for display in dashboards
 * @param teamData - Raw team data from API
 * @returns Transformed team data for UI
 */
export const transformTeamData = (teamData: any) => {
  const { name, currentRange, previousRange } = teamData;
  
  const frequencyTrend = determineTrend(
    currentRange.numOfDeploysPerDay,
    previousRange.numOfDeploysPerDay,
    MetricType.Frequency
  );
  
  const leadTimeTrend = determineTrend(
    currentRange.avgLeadTimeInSec,
    previousRange.avgLeadTimeInSec,
    MetricType.LeadTime
  );
  
  const failureRateTrend = determineTrend(
    currentRange.failureRatePercent,
    previousRange.failureRatePercent,
    MetricType.FailureRate
  );
  
  return {
    name,
    metrics: {
      deploymentFrequency: currentRange.numOfDeploysPerDay,
      leadTime: currentRange.avgLeadTimeInSec,
      failureRate: currentRange.failureRatePercent,
      mttr: currentRange.avgMttrDurationInSec,
    },
    trends: {
      frequency: frequencyTrend,
      leadTime: leadTimeTrend,
      failureRate: failureRateTrend,
    },
    overallTrend: determineOverallTrend(frequencyTrend, leadTimeTrend, failureRateTrend),
  };
};

/**
 * Processes project metrics response
 * @param response - Project metrics response from API
 * @returns Processed metrics data
 */
export const processProjectMetrics = (response: ProjectMetricsResponse): MetricData[] => {
  return processMetricsResponse(response.project);
};

/**
 * Processes team metrics response
 * @param response - Team metrics response from API
 * @returns Processed metrics data
 */
export const processTeamMetrics = (response: TeamMetricsResponse): MetricData[] => {
  return processMetricsResponse(response.team);
};

/**
 * Processes organization metrics response
 * @param response - Organization metrics response from API
 * @returns Array of processed team data
 */
export const processOrganizationMetrics = (response: OrganizationMetricsResponse): any[] => {
  return response.organization.teams.map(transformTeamData);
}; 