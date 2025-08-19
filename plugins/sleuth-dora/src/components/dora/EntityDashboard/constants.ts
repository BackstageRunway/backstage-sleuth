import { MetricType } from '../common/types/metrics';

export const METRIC_DESCRIPTIONS: Record<MetricType, string> = {
    [MetricType.Frequency]: 'How often an organization successfully releases to production',
    [MetricType.LeadTime]: 'The amount of time it takes a commit to get into production',
    [MetricType.Mttr]: 'How long it takes an organization to recover from a failure in production',
    [MetricType.FailureRate]: 'The percentage of deployments causing a failure in production'
};

export const METRIC_TARGETS: Record<MetricType, string> = {
    [MetricType.Frequency]: 'Multiple deploys per day',
    [MetricType.LeadTime]: 'Less than one hour',
    [MetricType.FailureRate]: 'Less than 15%',
    [MetricType.Mttr]: 'Less than one hour',
}; 