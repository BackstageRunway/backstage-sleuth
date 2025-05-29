import { useEntity } from '@backstage/plugin-catalog-react';
import { DORAMetricsView } from './details/DORAMetricsView';
import { Alert } from '@material-ui/lab';
import { makeStyles } from '@material-ui/core/styles';
import { DORASummaryContainer } from './summary/DORASummaryContainer';
import { CircularProgress, Grid, Paper } from '@material-ui/core';
import { useApi } from '@backstage/core-plugin-api';
import { useEffect, useState } from 'react';
import { doraBackendApiRef } from '../../api/DORABackendClient';
import { ApiInsight, MetricData, ProjectMetricsResponse, ProjectInsightsResponse } from './summary/types';
import { MetricType, getMetricPerformance, calculateTrendChange, getTrend } from '../../DORAMetricModel';
import { TimeRangeSelector } from './TimeRangeSelector';

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
    },
    content: {
        position: 'relative',
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    }
});

type TimeRange = 'last7days' | 'last14days' | 'last28days' | 'last90days';

export const EntityDoraMetrics = () => {
    const classes = useStyles();
    const { entity } = useEntity();
    const doraApi = useApi(doraBackendApiRef);
    const [error, setError] = useState<string | null>(null);
    const [metrics, setMetrics] = useState<MetricData[]>([]);
    const [insights, setInsights] = useState<ApiInsight[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('last28days');

    // Get the project ID from entity annotations
    const projectId = entity.metadata.annotations?.['sleuth.io/project-id'];

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

    const calculateTrendChange = (current: number, previous: number): number => {
        if (previous === 0) return 0;
        return ((current - previous) / previous) * 100;
    };

    const fetchMetrics = async (timeRange: TimeRange) => {
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

    const fetchMetricsInsights = async (timeRange: TimeRange) => {
        setLoading(true);
        try {
            const result = await doraApi.getProjectDORAMetricsInsights(
                orgId,
                projectSlug,
                environment,
                deployment,
                timeRange,
            );
            
            if (!result?.project?.insights) {
                throw new Error('No insights data available');
            }

            // "DEPLOYING" = frequency
            // "MTTR" = Mttr

            const mappedInsights = result.project.insights
                .filter((insight:any) => 
                    insight.__typename === 'MetricOffsetFromAverageInsightType' || 
                    insight.__typename === 'TeamMetricLowInsightType'
                )
                .map((insight:any) => ({
                    message: insight.message,
                    icon: insight.icon,
                    isPositive: insight.isPositive,
                    metricType: insight.insightMetricType === 'DEPLOYING' || insight.insightMetricType === 'FREQUENCY' ? 'Frequency' : 
                              insight.insightMetricType === 'MTTR' ? 'Mttr' : 
                              insight.insightMetricType === 'FAILURE_RATE' ? 'FailureRate' :
                              insight.insightMetricType
                }));

            setInsights(mappedInsights);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch insights');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMetrics(selectedTimeRange);
        fetchMetricsInsights(selectedTimeRange);
    }, [projectId, doraApi]);

    const handleTimeRangeChange = (range: TimeRange) => {
        setSelectedTimeRange(range);
        fetchMetrics(range);
        fetchMetricsInsights(range);
    };

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
            <TimeRangeSelector 
                selectedRange={selectedTimeRange}
                onRangeChange={handleTimeRangeChange}
            />
            <div className={classes.content}>
                {loading && (
                    <div className={classes.loadingOverlay}>
                        <CircularProgress />
                    </div>
                )}
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Paper className={classes.paper}>
                            <div className={classes.title}>DORA Metrics Overview</div>
                            <DORASummaryContainer 
                                metrics={metrics} 
                                insights={insights}
                            />
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
        </div>
    );
};