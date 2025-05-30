import { makeStyles } from '@material-ui/core/styles';
import { Grid, Typography, Box, Card, CardContent } from '@material-ui/core';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import TrendingDownIcon from '@material-ui/icons/TrendingDown';
import TrendingFlatIcon from '@material-ui/icons/TrendingFlat';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

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

const data = [
    { name: 'Jan', value: 2.1 },
    { name: 'Feb', value: 2.3 },
    { name: 'Mar', value: 2.5 },
    { name: 'Apr', value: 2.2 },
    { name: 'May', value: 2.4 },
    { name: 'Jun', value: 2.6 },
];

export const ExecutiveSummary = () => {
    const classes = useStyles();

    const metrics = [
        {
            label: 'Total Deployments',
            value: '4.01/day',
            trend: 'up',
            change: '32%',
            color: '#2ecc71',
            description: 'Across all projects',
        },
        {
            label: 'Average Lead Time',
            value: '25.5h',
            trend: 'down',
            change: '15%',
            color: '#3498db',
            description: 'Weighted average',
        },
        {
            label: 'Overall Failure Rate',
            value: '0%',
            trend: 'stable',
            change: '0%',
            color: '#e74c3c',
            description: 'Combined failures',
        },
        {
            label: 'Average MTTR',
            value: '0h',
            trend: 'stable',
            change: '0%',
            color: '#f1c40f',
            description: 'Mean time to recover',
        },
    ];

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'up':
                return <TrendingUpIcon className={classes.improving} />;
            case 'down':
                return <TrendingDownIcon className={classes.improving} />;
            default:
                return <TrendingFlatIcon className={classes.neutral} />;
        }
    };

    return (
        <Grid container spacing={3}>
            {metrics.map((metric) => (
                <Grid item xs={12} sm={6} md={3} key={metric.label}>
                    <Card className={classes.card}>
                        <CardContent>
                            <Typography className={classes.metricLabel}>
                                {metric.label}
                            </Typography>
                            <Typography className={classes.metricValue}>
                                {metric.value}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                                {metric.description}
                            </Typography>
                            <Box className={classes.trendContainer}>
                                {getTrendIcon(metric.trend)}
                                <Typography 
                                    className={`${classes.changeValue} ${
                                        metric.trend === 'up' ? classes.improving : 
                                        metric.trend === 'down' ? classes.improving : 
                                        classes.neutral
                                    }`}
                                >
                                    {metric.change}
                                </Typography>
                            </Box>
                            <Box className={classes.chartContainer}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={data}>
                                        <Line 
                                            type="monotone" 
                                            dataKey="value" 
                                            stroke={metric.color} 
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
            ))}
        </Grid>
    );
}; 