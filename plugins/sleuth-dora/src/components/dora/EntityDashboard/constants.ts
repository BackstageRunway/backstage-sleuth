import { MetricType } from '../common/types/metrics';

export const METRIC_DESCRIPTIONS: Record<MetricType, string> = {
    [MetricType.Frequency]: 'How often an organization successfully releases to production',
    [MetricType.LeadTime]: 'The amount of time it takes a commit to get into production',
    [MetricType.Mttr]: 'How long it takes to recover from a failure in production. Sleuth measures this for the whole project and environment, not per code deployment',
    [MetricType.FailureRate]: 'The percentage of deployments causing a failure in production'
};

export const METRIC_TARGETS: Record<MetricType, string> = {
    [MetricType.Frequency]: 'Multiple deploys per day',
    [MetricType.LeadTime]: 'Less than one day',
    [MetricType.FailureRate]: '5% or less',
    [MetricType.Mttr]: 'Less than one hour',
};

export const METRIC_LABELS: Record<MetricType, string> = {
    [MetricType.Frequency]: 'Frequency',
    [MetricType.LeadTime]: 'Lead Time',
    [MetricType.FailureRate]: 'Failure Rate',
    [MetricType.Mttr]: 'MTTR',
};
