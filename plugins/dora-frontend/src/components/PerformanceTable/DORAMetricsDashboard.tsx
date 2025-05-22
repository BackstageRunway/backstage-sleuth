import { makeStyles } from '@material-ui/core/styles';
import { MetricType, getMetricPerformance, calculateTrendChange, getTrend, Performance } from '../../DORAMetricModel';
import { useApi } from '@backstage/core-plugin-api';
import { doraBackendApiRef } from '../../api/DORABackendClient';
import { useEffect, useState } from 'react';
import { CircularProgress, Card, CardContent, Typography, Grid, Tooltip, Divider, List, ListItem, ListItemIcon, ListItemText } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import PerformanceTrendIndicator from './PerformanceTrendIndicator';
import InfoIcon from '@material-ui/icons/Info';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import WarningIcon from '@material-ui/icons/Warning';
import ErrorIcon from '@material-ui/icons/Error';
import CallMadeIcon from '@material-ui/icons/CallMade';
import CallReceivedIcon from '@material-ui/icons/CallReceived';
import RemoveIcon from '@material-ui/icons/Remove';

interface DORAMetricsDashboardProps {
    projectId: string;
    timeRange: {
        start: string;
        end: string;
    };
}

interface MetricData {
    metricName: MetricType;
    value: Performance;
    rawValue: number;
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
    card: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        },
    },
    cardContent: {
        flexGrow: 1,
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
    },
    metricHeader: {
        marginBottom: '1rem',
        textAlign: 'center',
    },
    metricName: {
        color: 'rgba(0, 0, 0, 0.87)',
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        marginBottom: '0.5rem',
        fontSize: '1rem',
    },
    metricValue: {
        fontSize: '2.5rem',
        fontWeight: 'bold',
        color: 'rgba(0, 0, 0, 0.87)',
        textAlign: 'center',
        lineHeight: 1.1,
    },
    trendValue: {
        fontSize: '0.875rem',
        textAlign: 'center',
        marginTop: '0.125rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.25rem',
    },
    positiveTrend: {
        color: '#4caf50',
    },
    negativeTrend: {
        color: '#f44336',
    },
    neutralTrend: {
        color: '#9e9e9e',
    },
    metricInfo: {
        marginTop: '0.75rem',
        fontSize: '0.875rem',
        color: 'rgba(0, 0, 0, 0.6)',
        textAlign: 'center',
    },
    targetValue: {
        fontWeight: 500,
        color: 'rgba(0, 0, 0, 0.87)',
    },
    divider: {
        margin: '1rem 0',
    },
    insightsList: {
        marginTop: '0.75rem',
        padding: 0,
    },
    insightItem: {
        padding: '0.5rem 0',
    },
    insightIcon: {
        minWidth: '32px',
    },
    goodInsight: {
        color: '#4caf50',
    },
    warningInsight: {
        color: '#ff9800',
    },
    criticalInsight: {
        color: '#f44336',
    },
    infoIcon: {
        fontSize: '1rem',
        color: 'rgba(0, 0, 0, 0.54)',
        cursor: 'help',
    },
});

const getMetricDescription = (metricType: MetricType): string => {
    switch (metricType) {
        case MetricType.Frequency:
            return 'How often an organization successfully releases to production';
        case MetricType.LeadTime:
            return 'The time it takes to go from code committed to code successfully running in production';
        case MetricType.FailureRate:
            return 'The percentage of deployments causing a failure in production';
        case MetricType.Mttr:
            return 'How long it takes an organization to recover from a failure in production';
        default:
            return '';
    }
};

const getMetricTarget = (metricType: MetricType): string => {
    switch (metricType) {
        case MetricType.Frequency:
            return 'Target: Multiple deploys per day';
        case MetricType.LeadTime:
            return 'Target: Less than one hour';
        case MetricType.FailureRate:
            return 'Target: Less than 15%';
        case MetricType.Mttr:
            return 'Target: Less than one hour';
        default:
            return '';
    }
};

const getMetricDisplayValue = (metricName: MetricType, rawValue: number): string => {
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

const getMetricInsights = (
    metricType: MetricType, 
    value: number, 
    percentageChange: number,
    styles: Record<string, string>
): { icon: JSX.Element; text: string; severity: 'good' | 'warning' | 'critical' }[] => {
    const insights: { icon: JSX.Element; text: string; severity: 'good' | 'warning' | 'critical' }[] = [];

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

export const DORAMetricsDashboard = ({ projectId, timeRange }: DORAMetricsDashboardProps) => {
    const classes = useStyles();
    const doraApi = useApi(doraBackendApiRef);
    const [error, setError] = useState<string | null>(null);
    const [metrics, setMetrics] = useState<MetricData[]>([]);
    const [loading, setLoading] = useState(true);
    const orgId = 'sleuth';
    const projectSlug = 'sleuth';
    const environment = 'production';
    const deployment = 'application';
    const timeRangeDummy = 'last28days';

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
                        <Card className={classes.card}>
                            <CardContent className={classes.cardContent}>
                                <div className={classes.metricHeader}>
                                    <Typography className={classes.metricName} variant="h6">
                                        {metric.metricName}
                                        <Tooltip title={getMetricDescription(metric.metricName)}>
                                            <InfoIcon className={classes.infoIcon} />
                                        </Tooltip>
                                    </Typography>
                                    <Typography className={classes.metricValue}>
                                        {getMetricDisplayValue(metric.metricName, metric.rawValue)}
                                    </Typography>
                                    <div className={`${classes.trendValue} ${
                                        (metric.metricName === MetricType.Frequency && metric.percentageChange > 0) ||
                                        (metric.metricName !== MetricType.Frequency && metric.percentageChange < 0)
                                            ? classes.positiveTrend 
                                            : (metric.metricName === MetricType.Frequency && metric.percentageChange < 0) ||
                                              (metric.metricName !== MetricType.Frequency && metric.percentageChange > 0)
                                                ? classes.negativeTrend 
                                                : classes.neutralTrend
                                    }`}>
                                        {(metric.metricName === MetricType.Frequency && metric.percentageChange > 0) ||
                                         (metric.metricName !== MetricType.Frequency && metric.percentageChange < 0) ? (
                                            <CallMadeIcon fontSize="small" />
                                        ) : (metric.metricName === MetricType.Frequency && metric.percentageChange < 0) ||
                                          (metric.metricName !== MetricType.Frequency && metric.percentageChange > 0) ? (
                                            <CallReceivedIcon fontSize="small" />
                                        ) : (
                                            <RemoveIcon fontSize="small" />
                                        )}
                                        {metric.percentageChange > 0 ? '+' : ''}{metric.percentageChange.toFixed(1)}%
                                    </div>
                                </div>

                                <Typography className={classes.metricInfo}>
                                    <span className={classes.targetValue}>
                                        {getMetricTarget(metric.metricName)}
                                    </span>
                                </Typography>

                                <Divider className={classes.divider} />

                                <List className={classes.insightsList}>
                                    {getMetricInsights(metric.metricName, metric.rawValue, metric.percentageChange, classes).map((insight, index) => (
                                        <ListItem key={index} className={classes.insightItem}>
                                            <ListItemIcon className={classes.insightIcon}>
                                                {insight.icon}
                                            </ListItemIcon>
                                            <ListItemText 
                                                primary={insight.text}
                                                primaryTypographyProps={{
                                                    variant: 'body2',
                                                    color: 'textSecondary'
                                                }}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </div>
    );
}; 