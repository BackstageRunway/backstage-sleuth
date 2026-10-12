/**
 * API-related types for DORA plugin
 */



/**
 * Insight metric types from API
 */
export type InsightMetricType = 'FAILURE_RATE' | 'DEPLOYING' | 'LEAD_TIME' | 'MTTR' | 'TREND' | 'PERFORMANCE';

/**
 * API insight interface
 */
export interface ApiInsight {
  message: string;
  icon: string;
  isPositive: boolean;
  metricType: string;
  status?: 'good' | 'warning' | 'critical';
  summary?: string;
}

/**
 * Project metrics response from API
 */
export interface ProjectMetricsResponse {
  project: {
    currentRange: {
      numOfDeploysPerDay: number;
      avgLeadTimeInSec: number;
      failureRatePercent: number;
      avgMttrDurationInSec: number;
    };
    previousRange: {
      numOfDeploysPerDay: number;
      avgLeadTimeInSec: number;
      failureRatePercent: number;
      avgMttrDurationInSec: number;
    };
  };
}

/**
 * Project insights response from API
 */
export interface ProjectInsightsResponse {
  data: {
    project: {
      insights: Array<{
        __typename: 'GreatTeamInsightType' | 'MetricOffsetFromAverageInsightType' | 'WorstDeployInsightType';
        insightMetricType?: InsightMetricType;
        offsetPercentage?: number;
        message?: string;
        icon?: string;
        isPositive?: boolean;
        insightLink?: string;
      }>;
    };
  };
}

/**
 * Metric insight interface for UI display
 */
export interface MetricInsight {
  icon: JSX.Element;
  text: string;
  type: InsightMetricType;
} 