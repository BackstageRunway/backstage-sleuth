import { makeStyles } from '@material-ui/core/styles';
import { Grid, Typography, Box, Card, CardContent, CircularProgress } from '@material-ui/core';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface ProjectHealthProps {
    data: any;
    loading: boolean;
    error: string | null;
}

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



export const ProjectHealth = ({ data, loading, error }: ProjectHealthProps) => {
    const classes = useStyles();

    const metrics = [
        {
            title: 'Deployment Frequency',
            key: 'numOfDeploysPerDay',
            unit: '/day',
            format: (value: number) => value.toFixed(2),
            color: '#2ecc71',
        },
        {
            title: 'Lead Time',
            key: 'avgLeadTimeInSec',
            unit: 'h',
            format: (value: number) => (value / 3600).toFixed(1), // Convert seconds to hours
            color: '#3498db',
        },
        {
            title: 'Failure Rate',
            key: 'failureRatePercent',
            unit: '%',
            format: (value: number) => value.toFixed(1),
            color: '#e74c3c',
        },
        {
            title: 'MTTR',
            key: 'avgMttrDurationInSec',
            unit: 'h',
            format: (value: number) => (value / 3600).toFixed(1), // Convert seconds to hours
            color: '#f1c40f',
        },
    ];

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <Typography color="error">Failed to load organization metrics: {error}</Typography>
            </Box>
        );
    }

    const quartersData = data?.organization?.metricsRecapWithQuarters?.quarters;
    
    if (!quartersData || quartersData.length === 0) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <Typography color="textSecondary">No quarterly data available</Typography>
            </Box>
        );
    }

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
                                        data={quartersData.map((quarter: any, index: number) => ({
                                            name: `Q${index + 1}`,
                                            value: quarter[metric.key as keyof typeof quarter] as number,
                                            date: new Date(quarter.startIncl).toLocaleDateString(),
                                        }))}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip
                                            formatter={value => [`${metric.format(Number(value))}${metric.unit}`, '']}
                                            labelFormatter={(label, payload) => {
                                                if (payload && payload[0]) {
                                                    return `Quarter: ${label} (${payload[0].payload.date})`;
                                                }
                                                return label;
                                            }}
                                            contentStyle={{
                                                background: 'rgba(255, 255, 255, 0.9)',
                                                border: 'none',
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                            }}
                                        />
                                        <Bar dataKey="value" radius={[4, 4, 0, 0]} fill={metric.color} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Box>
                            <Grid container spacing={1} className={classes.comparisonContainer}>
                                {quartersData.map((quarter: any, index: number) => {
                                    const value = quarter[metric.key as keyof typeof quarter] as number;
                                    
                                                                         return (
                                         <Grid item xs={3} key={`quarter-${index}`}>
                                             <Box display="flex" flexDirection="column" alignItems="center">
                                                 <Typography
                                                     className={classes.projectName}
                                                     style={{
                                                         fontWeight: 400,
                                                         fontSize: '0.75rem',
                                                         height: '2em',
                                                         lineHeight: '1em',
                                                         display: 'flex',
                                                         alignItems: 'center',
                                                         justifyContent: 'center',
                                                         textAlign: 'center',
                                                         overflow: 'hidden',
                                                         whiteSpace: 'pre-line',
                                                     }}
                                                 >
                                                     Q{index + 1}
                                                 </Typography>
                                                                                                   <Typography 
                                                      className={classes.metricValue}
                                                      style={{ fontSize: '0.9rem' }}
                                                  >
                                                      {metric.format(value)}
                                                  </Typography>
                                                
                                            </Box>
                                        </Grid>
                                    );
                                })}
                                                         </Grid>
                             <Box display="flex" justifyContent="center" marginTop="0.5rem">
                                 <Typography 
                                     style={{ 
                                         fontSize: '0.8rem', 
                                         color: '#7f8c8d',
                                         fontWeight: 500
                                     }}
                                 >
                                     Unit: {metric.unit}
                                 </Typography>
                             </Box>
                         </CardContent>
                     </Card>
                </Grid>
            ))}
        </Grid>
    );
}; 