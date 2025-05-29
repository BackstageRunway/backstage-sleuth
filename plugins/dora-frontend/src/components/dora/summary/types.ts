import { MetricType, Performance } from '../../../DORAMetricModel';

export interface DORASummaryContainerProps {
    projectId: string;
    timeRange: {
        start: string;
        end: string;
    };
}

export type InsightMetricType = 'FAILURE_RATE' | 'DEPLOYING' | 'LEAD_TIME' | 'MTTR';

export interface ApiInsight {
    message: string;
    icon: string;
    isPositive: boolean;
    metricType:string;
}

export interface MetricData {
    metricName: MetricType;
    value: Performance;
    rawValue: number;
    previousValue: Performance;
    percentageChange: number;
    trend: 'up' | 'down' | 'stable';
    apiInsight?: ApiInsight;
}

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

export interface MetricInsight {
    icon: JSX.Element;
    text: string;
    severity: 'good' | 'warning' | 'critical';
} 