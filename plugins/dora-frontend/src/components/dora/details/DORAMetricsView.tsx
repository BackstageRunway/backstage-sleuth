import { makeStyles } from '@material-ui/core/styles';
import { MetricType, getMetricPerformance, calculateTrendChange, getTrend, Performance } from '../../../DORAMetricModel';
import DetailsTable from './DetailsTable';
import { useApi } from '@backstage/core-plugin-api';
import { doraBackendApiRef } from '../../../api/DORABackendClient';
import { useEffect, useState } from 'react';
import { CircularProgress } from '@material-ui/core';
import { Alert } from '@material-ui/lab';

interface DORAMetricsViewProps {
    projectId: string;
    timeRange: {
        start: string;
        end: string;
    };
}

interface MetricData {
    metricName: MetricType;
    value: Performance;
    previousValue: Performance;
    percentageChange: number;
    trend: 'improving' | 'ailing';
}

interface ProjectMetricsResponse {
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

const useStyles = makeStyles({
    container: {
        padding: '1rem',
    },
    error: {
        marginBottom: '1rem',
    },
    loader: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '200px',
    },
});

export const DORAMetricsView = ({ projectId, timeRange }: DORAMetricsViewProps) => {
    const classes = useStyles();
    const doraApi = useApi(doraBackendApiRef);
    const [error, setError] = useState<string | null>(null);
    const [metrics, setMetrics] = useState<MetricData[]>([]);
    const [loading, setLoading] = useState(true);
    const orgId = 'sleuth';
    const projectSlug = 'sleuth';
    const environment = 'production';
    const deployment = 'application';
    const timeRangeDummy = 'last28days'

    useEffect(() => {
        const fetchMetrics = async () => {
            setLoading(true);
            try {
                const result = await doraApi.getProjectDORAMetrics(orgId, projectSlug, environment, deployment, timeRangeDummy) as ProjectMetricsResponse;
                
                if (!result || !result.project) {
                    throw new Error('No metrics data available');
                }

                const project = result.project;

                const metricsData: MetricData[] = [
                    {
                        metricName: MetricType.Frequency,
                        value: getMetricPerformance(MetricType.Frequency, project.currentRange.numOfDeploysPerDay),
                        previousValue: getMetricPerformance(MetricType.Frequency, project.previousRange.numOfDeploysPerDay),
                        percentageChange: calculateTrendChange(
                            project.currentRange.numOfDeploysPerDay,
                            project.previousRange.numOfDeploysPerDay
                        ),
                        trend: getTrend(
                            MetricType.Frequency,
                            project.currentRange.numOfDeploysPerDay,
                            project.previousRange.numOfDeploysPerDay
                        ),
                    },
                    {
                        metricName: MetricType.LeadTime,
                        value: getMetricPerformance(MetricType.LeadTime, project.currentRange.avgLeadTimeInSec),
                        previousValue: getMetricPerformance(MetricType.LeadTime, project.previousRange.avgLeadTimeInSec),
                        percentageChange: calculateTrendChange(
                            project.currentRange.avgLeadTimeInSec,
                            project.previousRange.avgLeadTimeInSec
                        ),
                        trend: getTrend(
                            MetricType.LeadTime,
                            project.currentRange.avgLeadTimeInSec,
                            project.previousRange.avgLeadTimeInSec
                        ),
                    },
                    {
                        metricName: MetricType.FailureRate,
                        value: getMetricPerformance(MetricType.FailureRate, project.currentRange.failureRatePercent),
                        previousValue: getMetricPerformance(MetricType.FailureRate, project.previousRange.failureRatePercent),
                        percentageChange: calculateTrendChange(
                            project.currentRange.failureRatePercent,
                            project.previousRange.failureRatePercent
                        ),
                        trend: getTrend(
                            MetricType.FailureRate,
                            project.currentRange.failureRatePercent,
                            project.previousRange.failureRatePercent
                        ),
                    },
                    {
                        metricName: MetricType.Mttr,
                        value: getMetricPerformance(MetricType.Mttr, project.currentRange.avgMttrDurationInSec),
                        previousValue: getMetricPerformance(MetricType.Mttr, project.previousRange.avgMttrDurationInSec),
                        percentageChange: calculateTrendChange(
                            project.currentRange.avgMttrDurationInSec,
                            project.previousRange.avgMttrDurationInSec
                        ),
                        trend: getTrend(
                            MetricType.Mttr,
                            project.currentRange.avgMttrDurationInSec,
                            project.previousRange.avgMttrDurationInSec
                        ),
                    },
                ];

                setMetrics(metricsData);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
            } finally {
                setLoading(false);
            }
        };

        fetchMetrics();
    }, [projectId, timeRange, doraApi]);

    if (loading) {
        return (
            <div className={classes.loader}>
                <CircularProgress />
            </div>
        );
    }

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
            <DetailsTable metrics={metrics} />
        </div>
    );
};