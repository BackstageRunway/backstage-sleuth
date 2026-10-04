/**
 * Insight generation utilities for DORA metrics
 */

import { MetricType, Performance } from '../types/metrics';
import { getMetricPerformance } from './calculations';
import { ApiInsight, MetricInsight } from '../types/api';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import WarningIcon from '@material-ui/icons/Warning';
import ErrorIcon from '@material-ui/icons/Error';

// Wording per metric; the elite text mirrors the thresholds in constants/thresholds.ts
const LEVEL_TEXT: Record<MetricType, { name: string; elite: string; medium: string; low: string; improving: string }> = {
    [MetricType.Frequency]: {
        name: 'deployment frequency',
        elite: 'at least one deploy per day',
        medium: 'Consider deploying more often',
        low: 'Deployment frequency needs immediate attention',
        improving: 'Deployment frequency is improving',
    },
    [MetricType.LeadTime]: {
        name: 'lead time',
        elite: 'under one day',
        medium: 'Consider optimizing CI/CD pipeline',
        low: 'Lead time needs immediate optimization',
        improving: 'Lead time is improving',
    },
    [MetricType.FailureRate]: {
        name: 'failure rate',
        elite: '5% or less',
        medium: 'Consider improving test coverage',
        low: 'Failure rate needs immediate attention',
        improving: 'Failure rate is improving',
    },
    [MetricType.Mttr]: {
        name: 'MTTR',
        elite: 'under one hour',
        medium: 'Consider improving incident response',
        low: 'MTTR needs immediate improvement',
        improving: 'Recovery time is improving',
    },
};

/**
 * Generates metric-specific insights based on values and trends
 * @param metricType - Type of metric
 * @param value - Current metric value
 * @param percentageChange - Percentage change from previous period
 * @param styles - CSS styles object for icons
 * @param apiInsight - Optional API-provided insight
 * @returns Array of metric insights
 */
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

    // Rate the current level with the same thresholds as the rating grid, so the card and the grid agree
    const level = getMetricPerformance(metricType, value);
    const noIncidents = metricType === MetricType.Mttr && value === 0;

    if (noIncidents) {
        insights.push({
            icon: <CheckCircleIcon className={styles.goodInsight} />,
            text: 'No incidents in this period',
            type: 'PERFORMANCE'
        });
    } else if (level === Performance.Elite) {
        insights.push({
            icon: <CheckCircleIcon className={styles.goodInsight} />,
            text: `Meeting elite ${LEVEL_TEXT[metricType].name} target`,
            type: 'PERFORMANCE'
        });
    } else if (level === Performance.High) {
        insights.push({
            icon: <CheckCircleIcon className={styles.goodInsight} />,
            text: `High performance; elite is ${LEVEL_TEXT[metricType].elite}`,
            type: 'PERFORMANCE'
        });
    } else if (level === Performance.Medium) {
        insights.push({
            icon: <WarningIcon className={styles.warningInsight} />,
            text: LEVEL_TEXT[metricType].medium,
            type: 'PERFORMANCE'
        });
    } else {
        insights.push({
            icon: <ErrorIcon className={styles.criticalInsight} />,
            text: LEVEL_TEXT[metricType].low,
            type: 'PERFORMANCE'
        });
    }

    // Trend against the previous period; for everything but frequency, lower is better
    const improving = metricType === MetricType.Frequency ? percentageChange > 0 : percentageChange < 0;
    if (improving) {
        insights.push({
            icon: <CheckCircleIcon className={styles.goodInsight} />,
            text: LEVEL_TEXT[metricType].improving,
            type: 'TREND'
        });
    }

    return insights;
} 