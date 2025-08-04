import { MetricType } from '../../../../DORAMetricModel';

export const formatMetricValue = (metricName: MetricType, value: number): string => {
    switch (metricName) {
        case MetricType.Frequency:
            return `${value.toFixed(2)}/day`;
        case MetricType.LeadTime:
            return `${(value / 3600).toFixed(1)}h`;
        case MetricType.FailureRate:
            return `${value.toFixed(1)}%`;
        case MetricType.Mttr:
            return `${(value / 3600).toFixed(1)}h`;
        default:
            return value.toString();
    }
}; 