import { MetricType } from '../../../DORAMetricModel';
import { MetricInsight } from './types';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import WarningIcon from '@material-ui/icons/Warning';
import ErrorIcon from '@material-ui/icons/Error';

export const getMetricDisplayValue = (metricName: MetricType, rawValue: number): string => {
    switch (metricName) {
        case MetricType.Frequency:
            return `${rawValue.toFixed(2)}/day`;
        case MetricType.LeadTime:
            return `${(rawValue / 3600).toFixed(1)}h`;
        case MetricType.FailureRate:
            return `${rawValue.toFixed(1)}%`;
        case MetricType.Mttr:
            return `${(rawValue / 3600).toFixed(1)}h`;
        default:
            return rawValue.toString();
    }
};

export const getMetricInsights = (
    metricType: MetricType, 
    value: number, 
    percentageChange: number,
    styles: Record<string, string>
): MetricInsight[] => {
    const insights: MetricInsight[] = [];

    switch (metricType) {
        case MetricType.Frequency:
            if (value >= 1) {
                insights.push({
                    icon: <CheckCircleIcon className={styles.goodInsight} />,
                    text: 'Meeting elite deployment frequency target',
                    severity: 'good'
                });
            } else if (value >= 0.5) {
                insights.push({
                    icon: <WarningIcon className={styles.warningInsight} />,
                    text: 'Consider increasing deployment frequency',
                    severity: 'warning'
                });
            } else {
                insights.push({
                    icon: <ErrorIcon className={styles.criticalInsight} />,
                    text: 'Deployment frequency needs immediate attention',
                    severity: 'critical'
                });
            }
            if (percentageChange > 0) {
                insights.push({
                    icon: <CheckCircleIcon className={styles.goodInsight} />,
                    text: 'Deployment frequency is improving',
                    severity: 'good'
                });
            }
            break;

        case MetricType.LeadTime:
            const leadTimeHours = value / 3600;
            if (leadTimeHours <= 1) {
                insights.push({
                    icon: <CheckCircleIcon className={styles.goodInsight} />,
                    text: 'Meeting elite lead time target',
                    severity: 'good'
                });
            } else if (leadTimeHours <= 24) {
                insights.push({
                    icon: <WarningIcon className={styles.warningInsight} />,
                    text: 'Consider optimizing CI/CD pipeline',
                    severity: 'warning'
                });
            } else {
                insights.push({
                    icon: <ErrorIcon className={styles.criticalInsight} />,
                    text: 'Lead time needs immediate optimization',
                    severity: 'critical'
                });
            }
            if (percentageChange < 0) {
                insights.push({
                    icon: <CheckCircleIcon className={styles.goodInsight} />,
                    text: 'Lead time is improving',
                    severity: 'good'
                });
            }
            break;

        case MetricType.FailureRate:
            if (value <= 15) {
                insights.push({
                    icon: <CheckCircleIcon className={styles.goodInsight} />,
                    text: 'Meeting failure rate target',
                    severity: 'good'
                });
            } else if (value <= 30) {
                insights.push({
                    icon: <WarningIcon className={styles.warningInsight} />,
                    text: 'Consider improving test coverage',
                    severity: 'warning'
                });
            } else {
                insights.push({
                    icon: <ErrorIcon className={styles.criticalInsight} />,
                    text: 'Failure rate needs immediate attention',
                    severity: 'critical'
                });
            }
            if (percentageChange < 0) {
                insights.push({
                    icon: <CheckCircleIcon className={styles.goodInsight} />,
                    text: 'Failure rate is improving',
                    severity: 'good'
                });
            }
            break;

        case MetricType.Mttr:
            const mttrHours = value / 3600;
            if (mttrHours <= 1) {
                insights.push({
                    icon: <CheckCircleIcon className={styles.goodInsight} />,
                    text: 'Meeting elite MTTR target',
                    severity: 'good'
                });
            } else if (mttrHours <= 24) {
                insights.push({
                    icon: <WarningIcon className={styles.warningInsight} />,
                    text: 'Consider improving incident response',
                    severity: 'warning'
                });
            } else {
                insights.push({
                    icon: <ErrorIcon className={styles.criticalInsight} />,
                    text: 'MTTR needs immediate improvement',
                    severity: 'critical'
                });
            }
            if (percentageChange < 0) {
                insights.push({
                    icon: <CheckCircleIcon className={styles.goodInsight} />,
                    text: 'Recovery time is improving',
                    severity: 'good'
                });
            }
            break;
    }

    return insights;
}; 