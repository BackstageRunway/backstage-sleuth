import { makeStyles } from '@material-ui/core/styles';
import { Grid, Typography, Box, Card, CardContent } from '@material-ui/core';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import TrendingDownIcon from '@material-ui/icons/TrendingDown';
import TrendingFlatIcon from '@material-ui/icons/TrendingFlat';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

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
}

const useStyles = makeStyles({
    card: {
        height: '100%',
        background: 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
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
        background: 'linear-gradient(45deg, #2c3e50 30%, #3498db 90%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '0.5rem',
    },
    metricLabel: {
        fontSize: '1rem',
        color: '#7f8c8d',
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
        color: '#7f8c8d',
    },
});

// Helper function to convert seconds to hours
const secondsToHours = (seconds: number): number => {
    return seconds / 3600;
};

// Helper function to calculate trend and change percentage
const calculateTrend = (quarters: any[], metricKey: string): { trend: string, change: string, isImproving: boolean } => {
    if (quarters.length < 2) return { trend: 'flat', change: '0%', isImproving: false };
    
    // Calculate average of first half vs second half for more stable comparison
    const midPoint = Math.floor(quarters.length / 2);
    const firstHalf = quarters.slice(0, midPoint);
    const secondHalf = quarters.slice(midPoint);
    
    const firstHalfAvg = firstHalf.reduce((sum, q) => sum + q[metricKey], 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, q) => sum + q[metricKey], 0) / secondHalf.length;
    
    // Avoid division by zero
    if (firstHalfAvg === 0) {
        if (secondHalfAvg === 0) {
            return { trend: 'flat', change: '0%', isImproving: false };
        } else {
            // nothing to compare against; higher is only an improvement for deployments
            return { trend: 'up', change: 'new', isImproving: metricKey === 'numOfDeploysPerDay' };
        }
    }
    
    const percentageChange = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg * 100);
    
    // Round the percentage: if decimal >= 0.5, round up; otherwise round down
    const roundedPercentage = Math.round(percentageChange);
    
    switch (metricKey) {
        case 'numOfDeploysPerDay':
            // For deployments, higher is better
            if (secondHalfAvg > firstHalfAvg) {
                return { trend: 'up', change: `+${roundedPercentage}%`, isImproving: true };
            } else if (secondHalfAvg < firstHalfAvg) {
                return { trend: 'down', change: `${roundedPercentage}%`, isImproving: false };
            }
            break;
            
        case 'avgLeadTimeInSec':
            // For lead time, lower is better
            if (secondHalfAvg < firstHalfAvg) {
                return { trend: 'down', change: `${Math.abs(roundedPercentage)}%`, isImproving: true };
            } else if (secondHalfAvg > firstHalfAvg) {
                return { trend: 'up', change: `${roundedPercentage}%`, isImproving: false };
            }
            break;
            
        case 'failureRatePercent':
            // For failure rate, lower is better
            if (secondHalfAvg < firstHalfAvg) {
                return { trend: 'down', change: `${Math.abs(roundedPercentage)}%`, isImproving: true };
            } else if (secondHalfAvg > firstHalfAvg) {
                return { trend: 'up', change: `${roundedPercentage}%`, isImproving: false };
            }
            break;
            
        case 'avgMttrDurationInSec':
            // For MTTR, lower is better
            if (secondHalfAvg < firstHalfAvg) {
                return { trend: 'down', change: `${Math.abs(roundedPercentage)}%`, isImproving: true };
            } else if (secondHalfAvg > firstHalfAvg) {
                return { trend: 'up', change: `${roundedPercentage}%`, isImproving: false };
            }
            break;
    }
    
    return { trend: 'flat', change: '0%', isImproving: false };
};

export const ExecutiveSummary = ({ metricsData }: ExecutiveSummaryProps) => {
    const classes = useStyles();

    // Show loading state if no data
    if (!metricsData) {
        return (
            <div className={classes.loadingContainer}>
                <Typography>No metrics data available</Typography>
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

    // Calculate trends with improvement indicators
    const deploymentsTrend = calculateTrend(metricsData.quarters, 'numOfDeploysPerDay');
    const leadTimeTrend = calculateTrend(metricsData.quarters, 'avgLeadTimeInSec');
    const failureRateTrend = calculateTrend(metricsData.quarters, 'failureRatePercent');
    const mttrTrend = calculateTrend(metricsData.quarters, 'avgMttrDurationInSec');

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
            value: `${secondsToHours(metricsData.totalRecap.avgLeadTimeInSec).toFixed(1)}h`,
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
            value: `${Math.round(metricsData.totalRecap.avgMttrDurationInSec / 60)}m`,
            trend: mttrTrend.trend,
            change: mttrTrend.change,
            isImproving: mttrTrend.isImproving,
            color: '#f1c40f',
            description: 'Mean time to recover',
            data: mttrData,
        },
    ];

    const getTrendIcon = (trend: string, isImproving: boolean) => {
        const color = isImproving ? '#2ecc71' : '#e74c3c';
        
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
                const valueColor = metric.isImproving ? '#2ecc71' : '#e74c3c';
                const lineColor = metric.isImproving ? '#2ecc71' : '#e74c3c';
                const changeColor = metric.isImproving ? '#2ecc71' : '#e74c3c';
                
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
                                </Box>
                                <Box className={classes.chartContainer}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={metric.data}>
                                            <Line 
                                                type="monotone" 
                                                dataKey="value" 
                                                stroke={lineColor} 
                                                strokeWidth={2} 
                                                dot={true} 
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