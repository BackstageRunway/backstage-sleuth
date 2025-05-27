import { useEntity } from '@backstage/plugin-catalog-react';
import { DORAMetricsView } from './details/DORAMetricsView';
import { Alert } from '@material-ui/lab';
import { makeStyles } from '@material-ui/core/styles';
import { DORASummaryContainer } from './summary/DORASummaryContainer';
import { CircularProgress, Grid, Paper } from '@material-ui/core';
import { useApi } from '@backstage/core-plugin-api';
import { useEffect, useState } from 'react';
import { doraBackendApiRef } from '../../api/DORABackendClient';
import { MetricData, ProjectMetricsResponse } from './summary/types';
import { MetricType, getMetricPerformance, calculateTrendChange, getTrend } from '../../DORAMetricModel';



const useStyles = makeStyles({
    error: {
        marginBottom: '1rem',
    },
    container: {
        padding: '1rem',
    },
    paper: {
        padding: '1rem',
        marginBottom: '1rem',
    },
    title: {
        marginBottom: '1rem',
        fontSize: '1.25rem',
        fontWeight: 500,
    },
    loader: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '200px',
    }
});

export const EntityDoraMetrics = () => {
    const classes = useStyles();
    const { entity } = useEntity();
    const doraApi = useApi(doraBackendApiRef);
    const [error, setError] = useState<string | null>(null);
    const [metrics, setMetrics] = useState<MetricData[]>([]);
    const [loading, setLoading] = useState(true);

    // Get the project ID from entity annotations
    const projectId = entity.metadata.annotations?.['sleuth.io/project-id'];

    console.log('Entity:', entity);
    console.log('Project ID:', projectId);

    if (!projectId) {
        return (
            <Alert severity="warning" className={classes.error}>
                No Sleuth project ID found in entity annotations. Add the 'sleuth.io/project-id' annotation to view DORA metrics.
                <br />
                Available annotations: {JSON.stringify(entity.metadata.annotations, null, 2)}
            </Alert>
        );
    }

    const orgId = 'sleuth';
    const projectSlug = 'sleuth';
    const environment = 'production';
    const deployment = 'application';
    const timeRange = 'last28days'

    useEffect(() => {
        const fetchMetrics = async () => {
            setLoading(true);
            try {
                const result = await doraApi.getProjectDORAMetrics(
                    orgId,
                    projectSlug,
                    environment,
                    deployment,
                    timeRange,
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
    }, [projectId, doraApi]);

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
                <Grid item xs={12}>
                    <Paper className={classes.paper}>
                        <div className={classes.title}>DORA Metrics Overview</div>
                        <DORASummaryContainer metrics={metrics}/>
                    </Paper>
                </Grid>
                <Grid item xs={12}>
                    <Paper className={classes.paper}>
                        <div className={classes.title}>Detailed DORA Metrics</div>
                        <DORAMetricsView metrics={metrics}/>
                    </Paper>
                </Grid>
            </Grid>
        </div>
    );
}; 