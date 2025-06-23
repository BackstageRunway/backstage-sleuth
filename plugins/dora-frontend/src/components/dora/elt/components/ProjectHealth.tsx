import { makeStyles } from '@material-ui/core/styles';
import { Grid, Typography, Box, Card, CardContent, LinearProgress, Tooltip as MuiTooltip } from '@material-ui/core';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import TrendingDownIcon from '@material-ui/icons/TrendingDown';
import TrendingFlatIcon from '@material-ui/icons/TrendingFlat';
import { projects } from '../metricsData';

const useStyles = makeStyles({
    card: {
        height: '100%',
        background: 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        borderRadius: '12px',
        transition: 'transform 0.2s',
        '&:hover': {
            transform: 'translateY(-4px)',
        },
    },
    metricTitle: {
        fontSize: '1.2rem',
        fontWeight: 600,
        marginBottom: '1.5rem',
        color: '#2c3e50',
        textAlign: 'center',
    },
    projectName: {
        fontSize: '0.9rem',
        fontWeight: 600,
        color: '#2c3e50',
    },
    metricValue: {
        fontSize: '1.1rem',
        fontWeight: 700,
        color: '#2c3e50',
    },
    metricLabel: {
        fontSize: '0.875rem',
        color: '#7f8c8d',
        marginBottom: '0.5rem',
    },
    chartContainer: {
        height: '200px',
        marginTop: '1rem',
    },
    progressBar: {
        height: '8px',
        borderRadius: '4px',
        backgroundColor: '#ecf0f1',
        '& .MuiLinearProgress-bar': {
            borderRadius: '4px',
        },
    },
    good: {
        '& .MuiLinearProgress-bar': {
            backgroundColor: '#2ecc71',
        },
    },
    warning: {
        '& .MuiLinearProgress-bar': {
            backgroundColor: '#f1c40f',
        },
    },
    critical: {
        '& .MuiLinearProgress-bar': {
            backgroundColor: '#e74c3c',
        },
    },
    trendContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        marginTop: '4px',
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
    changeValue: {
        fontSize: '0.75rem',
        fontWeight: 600,
    },
    comparisonContainer: {
        marginTop: '1rem',
        padding: '1rem',
        background: 'rgba(236, 240, 241, 0.5)',
        borderRadius: '8px',
    },
    barLabel: {
        fontSize: '0.75rem',
        fill: '#7f8c8d',
    },
});

const getTrendIcon = (trend: string, classes: any) => {
    switch (trend) {
        case 'up':
            return <TrendingUpIcon className={classes.improving} style={{ fontSize: '1rem' }} />;
        case 'down':
            return <TrendingDownIcon className={classes.improving} style={{ fontSize: '1rem' }} />;
        default:
            return <TrendingFlatIcon className={classes.neutral} style={{ fontSize: '1rem' }} />;
    }
};

export const ProjectHealth = () => {
    const classes = useStyles();

    const metrics = [
        {
            title: 'Deployment Frequency',
            key: 'frequency',
            unit: '/day',
            format: (value: number) => value.toFixed(2),
        },
        {
            title: 'Lead Time',
            key: 'leadTime',
            unit: 'h',
            format: (value: number) => value.toFixed(1),
        },
        {
            title: 'Failure Rate',
            key: 'failureRate',
            unit: '%',
            format: (value: number) => value.toFixed(1),
        },
        {
            title: 'MTTR',
            key: 'mttr',
            unit: 'h',
            format: (value: number) => value.toFixed(1),
        },
    ];

    return (
        <Grid container spacing={3}>
            {metrics.map((metric) => (
                <Grid item xs={12} sm={6} md={3} key={metric.title}>
                    <Card className={classes.card}>
                        <CardContent>
                            <Typography className={classes.metricTitle}>
                                {metric.title}
                            </Typography>
                            <Box className={classes.chartContainer}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={projects.map(project => ({
                                            name: project.name,
                                            value: project.metrics[metric.key as keyof typeof project.metrics].value,
                                            trend: project.metrics[metric.key as keyof typeof project.metrics].trend,
                                            change: project.metrics[metric.key as keyof typeof project.metrics].change,
                                            color: project.color,
                                        }))}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip
                                            formatter={(value: number) => [`${metric.format(value)}${metric.unit}`, '']}
                                            contentStyle={{
                                                background: 'rgba(255, 255, 255, 0.9)',
                                                border: 'none',
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                            }}
                                        />
                                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                            {projects.map((project, index) => (
                                                <Cell key={`cell-${index}`} fill={project.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </Box>
                            <Grid container spacing={2} className={classes.comparisonContainer}>
                                {projects.map((project) => (
                                    <Grid item xs={4} key={project.name}>
                                        <Box display="flex" flexDirection="column" alignItems="center">
                                            <Typography
                                                className={classes.projectName}
                                                style={{
                                                    fontWeight: 400,
                                                    fontSize: '0.85rem',
                                                    height: '2.4em',
                                                    lineHeight: '1.2em',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    textAlign: 'center',
                                                    overflow: 'hidden',
                                                    whiteSpace: 'pre-line',
                                                }}
                                            >
                                                {project.name}
                                            </Typography>
                                            <Typography className={classes.metricValue}>
                                                {metric.format(project.metrics[metric.key as keyof typeof project.metrics].value)}{metric.unit}
                                            </Typography>
                                            <Box className={classes.trendContainer}>
                                                {getTrendIcon(
                                                    project.metrics[metric.key as keyof typeof project.metrics].trend,
                                                    classes
                                                )}
                                                <Typography
                                                    className={`${classes.changeValue} ${
                                                        project.metrics[metric.key as keyof typeof project.metrics].trend === 'up'
                                                            ? classes.improving
                                                            : project.metrics[metric.key as keyof typeof project.metrics].trend === 'down'
                                                            ? classes.improving
                                                            : classes.neutral
                                                    }`}
                                                >
                                                    {project.metrics[metric.key as keyof typeof project.metrics].change}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
}; 