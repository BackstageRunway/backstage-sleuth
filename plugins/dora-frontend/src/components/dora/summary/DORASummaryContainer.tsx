import React, { useEffect, useState } from 'react';
import { Grid, CircularProgress } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { useApi } from '@backstage/core-plugin-api';
import { doraBackendApiRef } from '../../../api/DORABackendClient';
import { MetricType, getMetricPerformance, calculateTrendChange, getTrend } from '../../../DORAMetricModel';
import { DORASummaryContainerProps, MetricData, ProjectMetricsResponse } from './types';
import { useStyles } from './styles';
import { MetricCard } from './MetricCard';

export const DORASummaryContainer: React.FC<DORASummaryContainerProps> = ({ projectId, timeRange }) => {
    const classes = useStyles();
    const doraApi = useApi(doraBackendApiRef);
    const [error, setError] = useState<string | null>(null);
    const [metrics, setMetrics] = useState<MetricData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMetrics = async () => {
            setLoading(true);
            try {
                const result = await doraApi.getProjectDORAMetrics(
                    'sleuth',
                    'sleuth',
                    'production',
                    'application',
                    'last28days'
                ) as ProjectMetricsResponse;
                
                if (!result || !result.project) {
                    throw new Error('No metrics data available');
                }

                const project = result.project;
                const metricsData: MetricData[] = [
                    {
                        metricName: MetricType.Frequency,
                        value: getMetricPerformance(MetricType.Frequency, project.currentRange.numOfDeploysPerDay),
                        rawValue: project.currentRange.numOfDeploysPerDay,
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
                        rawValue: project.currentRange.avgLeadTimeInSec,
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
                        rawValue: project.currentRange.failureRatePercent,
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
                        rawValue: project.currentRange.avgMttrDurationInSec,
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
            <Grid container spacing={3}>
                {metrics.map((metric) => (
                    <Grid item xs={12} sm={6} md={3} key={metric.metricName}>
                        <MetricCard metric={metric} />
                    </Grid>
                ))}
            </Grid>
        </div>
    );
}; 