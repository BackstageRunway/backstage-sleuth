import { makeStyles } from '@material-ui/core/styles';
import { Grid, Typography, Box, Card, CardContent } from '@material-ui/core';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import TrendingDownIcon from '@material-ui/icons/TrendingDown';
import TrendingFlatIcon from '@material-ui/icons/TrendingFlat';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { formatDuration } from '../../common/utils/formatters';
import { describePeriodTrend } from '../../common/utils/calculations';
import { MetricType } from '../../common/types/metrics';

// Define the type for the metrics data
interface MetricsData {
    totalRecap: {
        numOfDeploys: number;
        numOfDeploysPerDay: number;
        avgLeadTimeInSec: number;
        failureRatePercent: number;
        avgMttrDurationInSec: number;
    };
    quarters: Array<{
        startIncl: string;
        endNotIncl: string;
        numOfDeploysPerDay: number;
        avgLeadTimeInSec: number;
        failureRatePercent: number;
        avgMttrDurationInSec: number;
    }>;
}

interface ExecutiveSummaryProps {
    metricsData?: MetricsData;
    // the period of the same length just before the selected one; absent with an older backend
    previousRecap?: MetricsData['totalRecap'];
}

const useStyles = makeStyles(theme => ({
    card: {
        height: '100%',
        // the light gradient would leave theme-coloured text unreadable in dark mode
        background: theme.palette.type === 'dark'
            ? theme.palette.background.default
            : 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        borderRadius: '12px',
        transition: 'all 0.3s ease',
        '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 12px rgba(0, 0, 0, 0.15)',
        },
    },
    metricValue: {
        fontSize: '2rem',
        fontWeight: 700,
        background: `linear-gradient(45deg, ${theme.palette.text.primary} 30%, #3498db 90%)`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '0.5rem',
    },
    metricLabel: {
        fontSize: '1rem',
        color: theme.palette.text.secondary,
        marginBottom: '1rem',
    },
    trendContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginTop: '0.5rem',
    },
    improving: {
        color: '#2ecc71',
    },
    ailing: {
        color: '#e74c3c',
    },
    neutral: {
        color: '#95a5a6',
    },
    chartContainer: {
        height: '60px',
        marginTop: '1rem',
    },
    changeValue: {
        fontSize: '0.875rem',
        fontWeight: 600,
    },
    loadingContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '200px',
        color: theme.palette.text.secondary,
    },
}));

// Helper function to convert seconds to hours
const secondsToHours = (seconds: number): number => {
    return seconds / 3600;
};

export const ExecutiveSummary = ({ metricsData, previousRecap }: ExecutiveSummaryProps) => {
    const classes = useStyles();

    // Show loading state if no data
    if (!metricsData) {
        return (
            <div className={classes.loadingContainer}>
                <Typography>No metrics data available</Typography>
            </div>
        );
    }

    // Zeros would otherwise read as a perfect lead time and failure rate
    if (metricsData.totalRecap.numOfDeploys === 0) {
        return (
            <div className={classes.loadingContainer}>
                <Typography>No deployments recorded in Sleuth in this period.</Typography>
            </div>
        );
    }

    // Transform quarters data for charts
    const deploymentsData = metricsData.quarters.map((quarter, index) => ({
        name: `Q${index + 1}`,
        value: quarter.numOfDeploysPerDay
    }));

    const leadTimeData = metricsData.quarters.map((quarter, index) => ({
        name: `Q${index + 1}`,
        value: secondsToHours(quarter.avgLeadTimeInSec)
    }));

    const failureRateData = metricsData.quarters.map((quarter, index) => ({
        name: `Q${index + 1}`,
        value: quarter.failureRatePercent
    }));

    const mttrData = metricsData.quarters.map((quarter, index) => ({
        name: `Q${index + 1}`,
        value: secondsToHours(quarter.avgMttrDurationInSec)
    }));

    // Trends compare the selected period with the one before it, as Sleuth and the component view do
    const current = metricsData.totalRecap;
    const noComparison = { trend: 'flat', change: 'n/a', isImproving: false };
    const hadDeployments = (previousRecap?.numOfDeploys ?? 0) > 0;
    // the periods are equally long, so deploy counts give the exact change in frequency
    const deploymentsTrend = previousRecap
        ? describePeriodTrend(MetricType.Frequency, current.numOfDeploys, previousRecap.numOfDeploys)
        : noComparison;
    const leadTimeTrend = previousRecap
        ? describePeriodTrend(MetricType.LeadTime, current.avgLeadTimeInSec, previousRecap.avgLeadTimeInSec, hadDeployments)
        : noComparison;
    const failureRateTrend = previousRecap
        ? describePeriodTrend(MetricType.FailureRate, current.failureRatePercent, previousRecap.failureRatePercent, hadDeployments)
        : noComparison;
    const mttrTrend = previousRecap
        ? describePeriodTrend(MetricType.Mttr, current.avgMttrDurationInSec, previousRecap.avgMttrDurationInSec)
        : noComparison;

    const metrics = [
        {
            label: 'Total Deployments',
            value: `${metricsData.totalRecap.numOfDeploysPerDay.toFixed(2)}/day`,
            trend: deploymentsTrend.trend,
            change: deploymentsTrend.change,
            isImproving: deploymentsTrend.isImproving,
            color: '#2ecc71',
            description: 'Across all projects',
            data: deploymentsData,
        },
        {
            label: 'Average Lead Time',
            value: formatDuration(metricsData.totalRecap.avgLeadTimeInSec),
            trend: leadTimeTrend.trend,
            change: leadTimeTrend.change,
            isImproving: leadTimeTrend.isImproving,
            color: '#3498db',
            description: 'Weighted average',
            data: leadTimeData,
        },
        {
            label: 'Overall Failure Rate',
            value: `${metricsData.totalRecap.failureRatePercent.toFixed(1)}%`,
            trend: failureRateTrend.trend,
            change: failureRateTrend.change,
            isImproving: failureRateTrend.isImproving,
            color: '#e74c3c',
            description: 'Combined failures',
            data: failureRateData,
        },
        {
            label: 'Average MTTR',
            value: formatDuration(metricsData.totalRecap.avgMttrDurationInSec),
            trend: mttrTrend.trend,
            change: mttrTrend.change,
            isImproving: mttrTrend.isImproving,
            color: '#f1c40f',
            description: 'Mean time to recover',
            data: mttrData,
        },
    ];

    // an unchanged or incomparable metric is neither good nor bad
    const trendColor = (trend: string, isImproving: boolean) => {
        if (trend === 'flat') return '#95a5a6';
        return isImproving ? '#2ecc71' : '#e74c3c';
    };

    const getTrendIcon = (trend: string, isImproving: boolean) => {
        const color = trendColor(trend, isImproving);
        
        switch (trend) {
            case 'up':
                return <TrendingUpIcon style={{ color }} />;
            case 'down':
                return <TrendingDownIcon style={{ color }} />;
            default:
                return <TrendingFlatIcon className={classes.neutral} />;
        }
    };

    return (
        <Grid container spacing={3}>
            {metrics.map((metric) => {
                // Determine colors based on whether the trend is improving
                const valueColor = trendColor(metric.trend, metric.isImproving);
                const lineColor = valueColor;
                const changeColor = valueColor;
                
                return (
                    <Grid item xs={12} sm={6} md={3} key={metric.label}>
                        <Card className={classes.card}>
                            <CardContent>
                                <Typography className={classes.metricLabel}>
                                    {metric.label}
                                </Typography>
                                <Typography className={classes.metricValue} style={{ color: valueColor }}>
                                    {metric.value}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                    {metric.description}
                                </Typography>
                                <Box className={classes.trendContainer}>
                                    {getTrendIcon(metric.trend, metric.isImproving)}
                                    <Typography 
                                        className={classes.changeValue}
                                        style={{ color: changeColor }}
                                    >
                                        {metric.change}
                                    </Typography>
                                    {metric.change !== 'n/a' && (
                                        <Typography variant="caption" color="textSecondary">
                                            vs previous period
                                        </Typography>
                                    )}
                                </Box>
                                <Box className={classes.chartContainer}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={metric.data}>
                                            <Line 
                                                type="monotone" 
                                                dataKey="value" 
                                                stroke={lineColor} 
                                                strokeWidth={2} 
                                                dot 
                                            />
                                            <XAxis dataKey="name" hide />
                                            <YAxis hide />
                                            <Tooltip />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                );
            })}
        </Grid>
    );
};