import { makeStyles } from '@material-ui/core/styles';
import { Grid, Typography, Box, Card, CardContent } from '@material-ui/core';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import TrendingDownIcon from '@material-ui/icons/TrendingDown';
import TrendingFlatIcon from '@material-ui/icons/TrendingFlat';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { projects } from '../metricsData';

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
});

const deploymentsData = [
    { name: 'Jan', value: 2.1 },
    { name: 'Feb', value: 2.7 },
    { name: 'Mar', value: 1.9 },
    { name: 'Apr', value: 2.4 },
    { name: 'May', value: 2.0 },
    { name: 'Jun', value: 2.8 },
];
const leadTimeData = [
    { name: 'Jan', value: 25 },
    { name: 'Feb', value: 22 },
    { name: 'Mar', value: 28 },
    { name: 'Apr', value: 24 },
    { name: 'May', value: 27 },
    { name: 'Jun', value: 23 },
];
const failureRateData = [
    { name: 'Jan', value: 1.2 },
    { name: 'Feb', value: 1.5 },
    { name: 'Mar', value: 0.8 },
    { name: 'Apr', value: 2.0 },
    { name: 'May', value: 1.7 },
    { name: 'Jun', value: 1.0 },
];
const mttrData = [
    { name: 'Jan', value: 2.5 },
    { name: 'Feb', value: 3.1 },
    { name: 'Mar', value: 1.7 },
    { name: 'Apr', value: 2.8 },
    { name: 'May', value: 2.2 },
    { name: 'Jun', value: 2.9 },
];

export const ExecutiveSummary = () => {
    const classes = useStyles();

    // Calculate summary metrics from projects
    const totalDeployments = projects.reduce((sum, p) => sum + p.metrics.frequency.value, 0);
    const avgLeadTime = projects.reduce((sum, p) => sum + p.metrics.leadTime.value, 0) / projects.length;
    const avgFailureRate = failureRateData.reduce((sum, d) => sum + d.value, 0) / failureRateData.length;
    const avgMTTR = mttrData.reduce((sum, d) => sum + d.value, 0) / mttrData.length;

    const metrics = [
        {
            label: 'Total Deployments',
            value: `${totalDeployments.toFixed(2)}/day`,
            trend: 'up',
            change: '32%',
            color: '#2ecc71',
            description: 'Across all projects',
            data: deploymentsData,
        },
        {
            label: 'Average Lead Time',
            value: `${avgLeadTime.toFixed(1)}h`,
            trend: 'down',
            change: '15%',
            color: '#3498db',
            description: 'Weighted average',
            data: leadTimeData,
        },
        {
            label: 'Overall Failure Rate',
            value: `${avgFailureRate > 0 ? avgFailureRate.toFixed(1) : '1.3'}%`,
            trend: avgFailureRate > 1 ? 'up' : 'down',
            change: avgFailureRate > 1 ? '+0.5%' : '-0.2%',
            color: '#e74c3c',
            description: 'Combined failures',
            data: failureRateData,
        },
        {
            label: 'Average MTTR',
            value: `${avgMTTR > 0 ? avgMTTR.toFixed(1) : '2.2'}h`,
            trend: avgMTTR > 2 ? 'up' : 'down',
            change: avgMTTR > 2 ? '+0.3%' : '-0.1%',
            color: '#f1c40f',
            description: 'Mean time to recover',
            data: mttrData,
        },
    ];

    const getTrendIcon = (trend: string, colorOverride?: string) => {
        switch (trend) {
            case 'up':
                return <TrendingUpIcon className={classes.improving} style={{ color: colorOverride || classes.improving.color }} />;
            case 'down':
                return <TrendingDownIcon className={classes.improving} style={{ color: colorOverride || classes.improving.color }} />;
            default:
                return <TrendingFlatIcon className={classes.neutral} style={{ color: colorOverride || classes.neutral.color }} />;
        }
    };

    return (
        <Grid container spacing={3}>
            {metrics.map((metric) => {
                // Determine color for value and line based on trend for failure rate and mttr
                let valueColor = metric.color;
                let lineColor = metric.color;
                let changeColor = undefined;
                let arrowColor = undefined;
                if (metric.label === 'Overall Failure Rate' || metric.label === 'Average MTTR') {
                    if (metric.trend === 'up') {
                        valueColor = '#e74c3c';
                        lineColor = '#e74c3c';
                        changeColor = '#e74c3c';
                        arrowColor = '#e74c3c';
                    } else if (metric.trend === 'down') {
                        valueColor = '#2ecc71';
                        lineColor = '#2ecc71';
                        changeColor = '#2ecc71';
                        arrowColor = '#2ecc71';
                    }
                }
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
                                    {getTrendIcon(metric.trend, arrowColor)}
                                    <Typography 
                                        className={`${classes.changeValue} ${
                                            metric.trend === 'up' ? classes.improving : 
                                            metric.trend === 'down' ? classes.improving : 
                                            classes.neutral
                                        }`}
                                        style={changeColor ? { color: changeColor } : {}}
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