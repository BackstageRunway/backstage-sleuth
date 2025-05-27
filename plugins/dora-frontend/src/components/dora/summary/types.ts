import { MetricType, Performance } from '../../../DORAMetricModel';

export interface DORASummaryContainerProps {
    projectId: string;
    timeRange: {
        start: string;
        end: string;
    };
}

export interface MetricData {
    metricName: MetricType;
    value: Performance;
    rawValue: number;
    previousValue: Performance;
    percentageChange: number;
    trend: 'improving' | 'ailing';
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

export interface MetricInsight {
    icon: JSX.Element;
    text: string;
    severity: 'good' | 'warning' | 'critical';
} 