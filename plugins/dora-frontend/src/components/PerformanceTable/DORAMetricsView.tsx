import { makeStyles } from '@material-ui/core/styles';
import { MetricType, getMetricPerformance, calculateTrendChange, getTrend } from '../../DORAMetricModel';
import DORAMetricsTable from './DORAMetricsTable';
import { useApi } from '@backstage/core-plugin-api';
import { doraBackendApiRef } from '../../api/DORABackendClient';
import { useEffect, useState } from 'react';
import { Alert } from '@material-ui/lab';

interface DORAMetricsViewProps {
    projectId: string;
    timeRange: {
        start: string;
        end: string;
    };
}

const useStyles = makeStyles({
    container: {
        padding: '1rem',
    },
    error: {
        marginBottom: '1rem',
    },
});

const InternalDORAMetricsView = ({ projectId, timeRange }: DORAMetricsViewProps) => {
    const classes = useStyles();
    const doraApi = useApi(doraBackendApiRef);
    const [error, setError] = useState<string | null>(null);
    const [metrics, setMetrics] = useState<any[]>([]);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const result = await doraApi.getMetrics(projectId, timeRange);
                
                const metricsData = [
                    {
                        metricName: MetricType.Frequency,
                        value: getMetricPerformance(MetricType.Frequency, result.currentRange.numOfDeploysPerDay),
                        previousValue: getMetricPerformance(MetricType.Frequency, result.previousRange.numOfDeploysPerDay),
                        percentageChange: calculateTrendChange(
                            result.currentRange.numOfDeploysPerDay,
                            result.previousRange.numOfDeploysPerDay
                        ),
                        trend: getTrend(
                            MetricType.Frequency,
                            result.currentRange.numOfDeploysPerDay,
                            result.previousRange.numOfDeploysPerDay
                        ),
                    },
                    {
                        metricName: MetricType.LeadTime,
                        value: getMetricPerformance(MetricType.LeadTime, result.currentRange.avgLeadTimeInSec),
                        previousValue: getMetricPerformance(MetricType.LeadTime, result.previousRange.avgLeadTimeInSec),
                        percentageChange: calculateTrendChange(
                            result.currentRange.avgLeadTimeInSec,
                            result.previousRange.avgLeadTimeInSec
                        ),
                        trend: getTrend(
                            MetricType.LeadTime,
                            result.currentRange.avgLeadTimeInSec,
                            result.previousRange.avgLeadTimeInSec
                        ),
                    },
                    {
                        metricName: MetricType.FailureRate,
                        value: getMetricPerformance(MetricType.FailureRate, result.currentRange.failureRatePercent),
                        previousValue: getMetricPerformance(MetricType.FailureRate, result.previousRange.failureRatePercent),
                        percentageChange: calculateTrendChange(
                            result.currentRange.failureRatePercent,
                            result.previousRange.failureRatePercent
                        ),
                        trend: getTrend(
                            MetricType.FailureRate,
                            result.currentRange.failureRatePercent,
                            result.previousRange.failureRatePercent
                        ),
                    },
                    {
                        metricName: MetricType.Mttr,
                        value: getMetricPerformance(MetricType.Mttr, result.currentRange.avgMttrDurationInSec),
                        previousValue: getMetricPerformance(MetricType.Mttr, result.previousRange.avgMttrDurationInSec),
                        percentageChange: calculateTrendChange(
                            result.currentRange.avgMttrDurationInSec,
                            result.previousRange.avgMttrDurationInSec
                        ),
                        trend: getTrend(
                            MetricType.Mttr,
                            result.currentRange.avgMttrDurationInSec,
                            result.previousRange.avgMttrDurationInSec
                        ),
                    },
                ];

                setMetrics(metricsData);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
            }
        };

        fetchMetrics();
    }, [projectId, timeRange, doraApi]);

    if (error) {
        return (
            <div className={classes.container}>
                <Alert severity="error" className={classes.error}>
                    {error}
                </Alert>
            </div>
        );
    }

    return (
        <div className={classes.container}>
            <DORAMetricsTable metrics={metrics} />
        </div>
    );
};

// Public wrapper component that accepts projectId and timeRange
export const DORAMetricsView = ({ projectId, timeRange }: DORAMetricsViewProps) => {
    return <InternalDORAMetricsView projectId={projectId} timeRange={timeRange} />;
};