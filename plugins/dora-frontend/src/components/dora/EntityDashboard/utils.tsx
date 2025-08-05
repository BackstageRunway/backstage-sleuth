import { MetricType } from '../common/types/metrics';
import { ApiInsight, InsightMetricType, MetricInsight } from '../common/types/api';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import WarningIcon from '@material-ui/icons/Warning';
import ErrorIcon from '@material-ui/icons/Error';

export function getMetricDisplayValue(metricName: MetricType, value: number): string {
    switch (metricName) {
        case MetricType.Frequency:
            return `${value.toFixed(2)}/day`;
        case MetricType.LeadTime:
            return `${(value / 3600).toFixed(1)}h`;
        case MetricType.Mttr:
            return `${(value / 3600).toFixed(1)}h`;
        case MetricType.FailureRate:
            return `${value.toFixed(1)}%`;
        default:
            return value.toString();
    }
}

export function getMetricInsights(
    metricType: MetricType,
    value: number,
    percentageChange: number,
    styles: Record<string, string>,
    apiInsight?: ApiInsight
): MetricInsight[] {
    const insights: MetricInsight[] = [];

    // Add API insight if available
    if (apiInsight) {
        insights.push({
            icon: apiInsight.icon === 'sparkles' ? 
                <CheckCircleIcon className={styles.goodInsight} /> : 
                <WarningIcon className={styles.warningInsight} />,
            text: apiInsight.message,
            type: 'PERFORMANCE'
        });
    }

    // Add metric-specific insights
    switch (metricType) {
        case MetricType.Frequency:
            if (value >= 1) {
                insights.push({
                    icon: <CheckCircleIcon className={styles.goodInsight} />,
                    text: 'Meeting elite deployment frequency target',
                    type: 'PERFORMANCE'
                });
            } else if (value >= 0.5) {
                // insights.push({
                //     icon: <WarningIcon className={styles.warningInsight} />,
                //     text: 'Consider increasing deployment frequency',
                //     type: 'PERFORMANCE'
                // });
            } else {
                insights.push({
                    icon: <ErrorIcon className={styles.criticalInsight} />,
                    text: 'Deployment frequency needs immediate attention',
                    type: 'PERFORMANCE'
                });
            }
            if (percentageChange > 0) {
                insights.push({
                    icon: <CheckCircleIcon className={styles.goodInsight} />,
                    text: 'Deployment frequency is improving',
                    type: 'TREND'
                });
            }
            break;

        case MetricType.LeadTime:
            const leadTimeHours = value / 3600;
            if (leadTimeHours <= 1) {
                insights.push({
                    icon: <CheckCircleIcon className={styles.goodInsight} />,
                    text: 'Meeting elite lead time target',
                    type: 'PERFORMANCE'
                });
            } else if (leadTimeHours <= 24) {
                insights.push({
                    icon: <WarningIcon className={styles.warningInsight} />,
                    text: 'Consider optimizing CI/CD pipeline',
                    type: 'PERFORMANCE'
                });
            } else {
                insights.push({
                    icon: <ErrorIcon className={styles.criticalInsight} />,
                    text: 'Lead time needs immediate optimization',
                    type: 'PERFORMANCE'
                });
            }
            if (percentageChange < 0) {
                insights.push({
                    icon: <CheckCircleIcon className={styles.goodInsight} />,
                    text: 'Lead time is improving',
                    type: 'TREND'
                });
            }
            break;

        case MetricType.FailureRate:
            if (value <= 15) {
                insights.push({
                    icon: <CheckCircleIcon className={styles.goodInsight} />,
                    text: 'Meeting failure rate target',
                    type: 'PERFORMANCE'
                });
            } else if (value <= 30) {
                insights.push({
                    icon: <WarningIcon className={styles.warningInsight} />,
                    text: 'Consider improving test coverage',
                    type: 'PERFORMANCE'
                });
            } else {
                insights.push({
                    icon: <ErrorIcon className={styles.criticalInsight} />,
                    text: 'Failure rate needs immediate attention',
                    type: 'PERFORMANCE'
                });
            }
            if (percentageChange < 0) {
                insights.push({
                    icon: <CheckCircleIcon className={styles.goodInsight} />,
                    text: 'Failure rate is improving',
                    type: 'TREND'
                });
            }
            break;

        case MetricType.Mttr:
            const mttrHours = value / 3600;
            if (mttrHours <= 1) {
                insights.push({
                    icon: <CheckCircleIcon className={styles.goodInsight} />,
                    text: 'Meeting elite MTTR target',
                    type: 'PERFORMANCE'
                });
            } else if (mttrHours <= 24) {
                insights.push({
                    icon: <WarningIcon className={styles.warningInsight} />,
                    text: 'Consider improving incident response',
                    type: 'PERFORMANCE'
                });
            } else {
                insights.push({
                    icon: <ErrorIcon className={styles.criticalInsight} />,
                    text: 'MTTR needs immediate improvement',
                    type: 'PERFORMANCE'
                });
            }
            if (percentageChange < 0) {
                insights.push({
                    icon: <CheckCircleIcon className={styles.goodInsight} />,
                    text: 'Recovery time is improving',
                    type: 'TREND'
                });
            }
            break;
    }

    return insights;
}



export const mapApiMetricTypeToInternal = (apiType: InsightMetricType): MetricType => {
    switch (apiType) {
        case 'FAILURE_RATE':
            return MetricType.FailureRate;
        case 'DEPLOYING':
            return MetricType.Frequency;
        case 'LEAD_TIME':
            return MetricType.LeadTime;
        case 'MTTR':
            return MetricType.Mttr;
        default:
            throw new Error(`Unknown API metric type: ${apiType}`);
    }
}; 